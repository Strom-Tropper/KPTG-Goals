import {
    GOAL_BET_LEVELS,
    GOAL_COLUMN_COUNT,
    GOAL_SLOT_COUNT,
    GOAL_STEP_MULTIPLIERS,
} from "./goal-constants";
import { GOAL_EVENT_NAMES, goalEvents } from "./goal-events";
import { goalErrorCode } from "./goal-errors";
import { goalState } from "./goal-state";
import type {
    GoalCellFace,
    GoalCellMark,
    GoalCellTile,
    GoalPickResult,
    GoalPlaying,
    GoalPlayResult,
    GoalRound,
    GoalStandby,
} from "./goal-types";

export type GoalEngine = {
    ChangeBetLevel(direction: -1 | 1): void;
    SetBetLevel(index: number): void;
    CanChangeBet(): boolean;
    CanReset(): boolean;
    ResetBet(): void;
    CanDecreaseBet(): boolean;
    CanIncreaseBet(): boolean;
    BetLevelNumber(): number;
    CanPlay(): boolean;
    CanRandom(): boolean;
    CanCashout(): boolean;
    IsPresentationLocked(): boolean;
    SetPresentationLocked(locked: boolean): void;
    ToggleBetList(): void;
    SecondsLeft(): number | null;
    SetSecondsLeft(seconds: number | null): void;
    Play(balance: number, units: readonly number[]): GoalPlayResult;
    Pick(slot: number): GoalPickResult;
    Cashout(): GoalPickResult;
    TakeCashout(): GoalPickResult;
    ApplyRound(round: GoalRound): void;
    RandomSlot(unit: number): number;
};

export const goalEngine: GoalEngine = {
    ChangeBetLevel,
    SetBetLevel,
    CanChangeBet,
    CanReset,
    ResetBet,
    CanDecreaseBet,
    CanIncreaseBet,
    BetLevelNumber,
    CanPlay,
    CanRandom,
    CanCashout,
    IsPresentationLocked,
    SetPresentationLocked,
    ToggleBetList,
    SecondsLeft,
    SetSecondsLeft,
    Play,
    Pick,
    Cashout,
    TakeCashout,
    ApplyRound,
    RandomSlot,
};

const FIRST_BET_LEVEL = GOAL_BET_LEVELS[0];

function ChangeBetLevel(direction: -1 | 1) {
    if (direction < 0 && !CanDecreaseBet()) return;
    if (direction > 0 && !CanIncreaseBet()) return;

    SetBetLevel(betIndex() + direction);
}

function SetBetLevel(index: number) {
    if (!CanChangeBet()) return;
    if (!Number.isInteger(index) || index < 0 || index >= GOAL_BET_LEVELS.length) {
        return;
    }

    const held = goalState.round.phase === "standby" ? goalState.round.column : undefined;
    goalState.error = null;
    goalState.betListOpen = false;
    goalState.round = {
        phase: "standby",
        betLevel: GOAL_BET_LEVELS[index],
        betChosen: true,
        column: held,
    };
    goalEvents.emit(GOAL_EVENT_NAMES.BET_LEVEL_CHANGED, goalState.round);
}

function CanChangeBet() {
    return !goalState.presentationLocked && goalState.round.phase === "standby";
}

function CanReset() {
    return !goalState.presentationLocked && goalState.round.phase === "ended";
}

function ResetBet() {
    const round = goalState.round;
    if (round.phase !== "ended") return;

    goalState.error = null;
    goalState.presentationLocked = false;
    goalState.betListOpen = false;
    goalState.round = {
        phase: "standby",
        betLevel: round.betLevel,
        betChosen: false,
        column: round.column,
    };
    goalEvents.emit(GOAL_EVENT_NAMES.STANDBY, goalState.round);
}

function CanDecreaseBet() {
    return CanChangeBet() && betIndex() > 0;
}

function CanIncreaseBet() {
    return CanChangeBet() && betIndex() < GOAL_BET_LEVELS.length - 1;
}

function BetLevelNumber() {
    return betIndex() + 1;
}

function betIndex() {
    const index = GOAL_BET_LEVELS.indexOf(
        goalState.round.betLevel as (typeof GOAL_BET_LEVELS)[number],
    );
    return index === -1 ? 0 : index;
}

function CanPlay() {
    if (goalState.presentationLocked) return false;
    const round = goalState.round;
    if (round.phase === "ended") return true;
    return round.phase === "standby" && round.betChosen;
}

function CanRandom() {
    return !goalState.presentationLocked && goalState.round.phase === "playing";
}

function CanCashout() {
    return (
        !goalState.presentationLocked &&
        goalState.round.phase === "playing" &&
        goalState.round.clearedColumns > 0
    );
}

function IsPresentationLocked() {
    return goalState.presentationLocked;
}

function SetPresentationLocked(locked: boolean) {
    if (goalState.presentationLocked === locked) return;

    goalState.presentationLocked = locked;
    goalEvents.emit(GOAL_EVENT_NAMES.PRESENTATION_LOCK_CHANGED, locked);
}

function ToggleBetList() {
    if (!CanChangeBet()) return;

    goalState.betListOpen = !goalState.betListOpen;
    goalEvents.emit(GOAL_EVENT_NAMES.BET_LIST_CHANGED, goalState.betListOpen);
}

function SecondsLeft() {
    return goalState.secondsLeft;
}

function SetSecondsLeft(seconds: number | null) {
    if (goalState.secondsLeft === seconds) return;

    goalState.secondsLeft = seconds;
    goalEvents.emit(GOAL_EVENT_NAMES.SECONDS_CHANGED, seconds);
}

function Play(balance: number, units: readonly number[]): GoalPlayResult {
    const round = goalState.round;
    const ready =
        round.phase === "ended" ||
        (round.phase === "standby" && round.betChosen);
    if (goalState.presentationLocked || !ready) {
        reject("state");
        return { ok: false, round };
    }

    if (balance < round.betLevel) {
        reject("balance");
        return { ok: false, round };
    }

    const playing = {
        phase: "playing" as const,
        betLevel: round.betLevel,
        column: 0,
        clearedColumns: 0,
        cashoutAmount: 0,
        traps: trapsFrom(units),
        cleared: [],
    };
    const started = {
        ok: true as const,
        round: playing,
        stake: round.betLevel,
    };
    goalState.error = null;
    goalState.betListOpen = false;
    goalState.round = playing;
    syncCells();
    goalEvents.emit(GOAL_EVENT_NAMES.PLAY_STARTED, started);
    return started;
}

function Pick(slot: number): GoalPickResult {
    const round = goalState.round;
    if (goalState.presentationLocked) {
        return { round, cashedOut: 0, lost: false };
    }
    if (
        round.phase !== "playing" ||
        slot < 0 ||
        slot >= GOAL_SLOT_COUNT ||
        !Number.isInteger(slot)
    ) {
        reject("slot");
        return { round, cashedOut: 0, lost: false };
    }

    if (slot === round.traps[round.column]) {
        const result: GoalPickResult = {
            cashedOut: 0,
            lost: true,
            round: standby(round.betLevel),
        };
        syncCells({ kind: "boom", column: round.column });
        endRound();
        result.round = goalState.round;
        goalEvents.emit(GOAL_EVENT_NAMES.PICK_RESOLVED, result);
        return result;
    }

    const amount = cashoutForClearedColumn(round.betLevel, round.column);
    const clearedColumns = round.clearedColumns + 1;

    if (clearedColumns >= GOAL_COLUMN_COUNT) {
        const finished: GoalPlaying = {
            ...round,
            column: round.column,
            clearedColumns,
            cashoutAmount: amount,
            cleared: [...round.cleared, { column: round.column, slot }],
        };
        goalState.round = finished;
        const result: GoalPickResult = {
            cashedOut: amount,
            lost: false,
            round: standby(round.betLevel),
        };
        syncCells({ kind: "bombs" });
        endRound();
        result.round = goalState.round;
        goalEvents.emit(GOAL_EVENT_NAMES.PICK_RESOLVED, result);
        return result;
    }

    goalState.error = null;
    goalState.round = {
        phase: "playing",
        betLevel: round.betLevel,
        column: round.column + 1,
        clearedColumns,
        cashoutAmount: amount,
        traps: round.traps,
        cleared: [...round.cleared, { column: round.column, slot }],
    };
    syncCells();
    const result: GoalPickResult = {
        round: goalState.round,
        cashedOut: 0,
        lost: false,
    };
    goalEvents.emit(GOAL_EVENT_NAMES.PICK_RESOLVED, result);
    return result;
}

function Cashout(): GoalPickResult {
    if (goalState.presentationLocked) {
        return { round: goalState.round, cashedOut: 0, lost: false };
    }
    if (!CanCashout() || goalState.round.phase !== "playing") {
        reject("state");
        return { round: goalState.round, cashedOut: 0, lost: false };
    }

    return payOut(GOAL_EVENT_NAMES.CASHOUT);
}

function TakeCashout(): GoalPickResult {
    const round = goalState.round;
    if (round.phase !== "playing") {
        return { round, cashedOut: 0, lost: false };
    }
    if (round.clearedColumns === 0) return loseRound();

    return payOut(GOAL_EVENT_NAMES.CASHOUT);
}

function loseRound(): GoalPickResult {
    const round = goalState.round;
    if (round.phase !== "playing") {
        return { round, cashedOut: 0, lost: false };
    }

    const result: GoalPickResult = {
        cashedOut: 0,
        lost: true,
        round: standby(round.betLevel),
    };
    syncCells({ kind: "loss" });
    endRound();
    result.round = goalState.round;
    goalEvents.emit(GOAL_EVENT_NAMES.PICK_RESOLVED, result);
    return result;
}

function ApplyRound(round: GoalRound) {
    goalState.error = null;
    goalState.presentationLocked = false;
    goalState.betListOpen = false;
    goalState.secondsLeft = null;
    goalState.round = round;
    syncCells();
    goalEvents.emit(GOAL_EVENT_NAMES.STANDBY, goalState.round);
}

function reject(reason: "balance" | "state" | "slot") {
    goalState.error = goalErrorCode(reason);
    goalEvents.emit(GOAL_EVENT_NAMES.ERROR, goalState.error);
}

function RandomSlot(unit: number) {
    const scaled = Math.floor(unit * GOAL_SLOT_COUNT);
    return Math.min(GOAL_SLOT_COUNT - 1, Math.max(0, scaled));
}

function payOut(event: string): GoalPickResult {
    const round = goalState.round;
    if (round.phase !== "playing") {
        return { round, cashedOut: 0, lost: false };
    }

    const result: GoalPickResult = {
        cashedOut: round.cashoutAmount,
        lost: false,
        round: standby(round.betLevel),
    };
    syncCells({ kind: "bombs" });
    endRound();
    result.round = goalState.round;
    goalEvents.emit(event, result);
    return result;
}

function endRound() {
    const round = goalState.round;
    if (round.phase !== "playing") return;

    goalState.presentationLocked = false;
    goalState.betListOpen = false;
    goalState.round = {
        phase: "ended",
        betLevel: round.betLevel,
        betChosen: true,
        column: round.column,
        clearedColumns: round.clearedColumns,
    };
}

function trapsFrom(units: readonly number[]): number[] {
    return Array.from({ length: GOAL_COLUMN_COUNT }, (_, column) =>
        RandomSlot(units[column] ?? 0),
    );
}

function standby(betLevel: number): GoalStandby {
    return {
        phase: "standby",
        betLevel: normalizeBetLevel(betLevel),
        betChosen: false,
    };
}

function normalizeBetLevel(betLevel: number) {
    if (GOAL_BET_LEVELS.includes(betLevel as (typeof GOAL_BET_LEVELS)[number])) {
        return betLevel;
    }

    return FIRST_BET_LEVEL;
}

function cashoutForClearedColumn(betLevel: number, clearedColumn: number) {
    const multiplier = GOAL_STEP_MULTIPLIERS[clearedColumn];
    const hundredths = Math.round(multiplier * 100);
    return Math.round((betLevel * hundredths) / 100);
}

function syncCells(reveal?: CellReveal) {
    const round = goalState.round;
    const faces = blankFaces();
    if (round.phase !== "playing") {
        goalState.cells = faces;
        return;
    }

    const boomColumn = reveal?.kind === "boom" ? reveal.column : null;
    const showBombs = reveal !== undefined;
    const pinkAll = reveal?.kind === "loss";

    for (let column = 0; column < GOAL_COLUMN_COUNT; column += 1) {
        const exploded = pinkAll || (boomColumn !== null && column >= boomColumn);
        for (let slot = 0; slot < GOAL_SLOT_COUNT; slot += 1) {
            const active =
                !showBombs && !exploded && column === round.column;
            faces[column][slot] = {
                tile: exploded ? "explode" : active ? "active" : "normal",
                mark: "none",
            };
        }
    }

    round.cleared.forEach((pick, index) => {
        const latest =
            boomColumn === null && index === round.cleared.length - 1;
        faces[pick.column][pick.slot] = {
            tile: "normal",
            mark: latest ? "ball" : "bullet",
        };
    });

    if (showBombs) {
        for (let column = 0; column < GOAL_COLUMN_COUNT; column += 1) {
            const slot = round.traps[column];
            if (boomColumn === column) {
                faces[column][slot].mark = "explode";
                continue;
            }
            if (faces[column][slot].mark !== "none") continue;

            faces[column][slot].mark = "bomb";
        }
    }

    goalState.cells = faces;
}

type CellReveal =
    | { kind: "boom"; column: number }
    | { kind: "bombs" }
    | { kind: "loss" };

function blankFaces(): GoalCellFace[][] {
    return Array.from({ length: GOAL_COLUMN_COUNT }, () =>
        Array.from({ length: GOAL_SLOT_COUNT }, () => cell("normal", "none")),
    );
}

function cell(tile: GoalCellTile, mark: GoalCellMark): GoalCellFace {
    return { tile, mark };
}

syncCells();
