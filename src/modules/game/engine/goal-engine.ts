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
    GoalPickResult,
    GoalPlayResult,
    GoalRound,
    GoalSlotPick,
    GoalStandby,
} from "./goal-types";

export type GoalEngine = {
    ChangeBetLevel(direction: -1 | 1): void;
    CanChangeBet(): boolean;
    CanPlay(): boolean;
    CanRandom(): boolean;
    CanCashout(): boolean;
    Play(balance: number, unit: number): GoalPlayResult;
    Pick(slot: number, unit: number): GoalPickResult;
    Cashout(): GoalPickResult;
    TakeCashout(): GoalPickResult;
    ApplyRound(round: GoalRound): void;
    RandomSlot(unit: number): number;
};

export const goalEngine: GoalEngine = {
    ChangeBetLevel,
    CanChangeBet,
    CanPlay,
    CanRandom,
    CanCashout,
    Play,
    Pick,
    Cashout,
    TakeCashout,
    ApplyRound,
    RandomSlot,
};

const FIRST_BET_LEVEL = GOAL_BET_LEVELS[0];

function ChangeBetLevel(direction: -1 | 1) {
    const round = goalState.round;
    if (round.phase !== "standby") return;

    const index = GOAL_BET_LEVELS.indexOf(
        round.betLevel as (typeof GOAL_BET_LEVELS)[number],
    );
    const current = index === -1 ? 0 : index;
    const next = Math.min(
        GOAL_BET_LEVELS.length - 1,
        Math.max(0, current + direction),
    );

    goalState.error = null;
    goalState.round = {
        phase: "standby",
        betLevel: GOAL_BET_LEVELS[next],
        betChosen: true,
    };
    syncCells();
    goalEvents.emit(GOAL_EVENT_NAMES.BET_LEVEL_CHANGED, goalState.round);
}

function CanChangeBet() {
    return goalState.round.phase === "standby";
}

function CanPlay() {
    return goalState.round.phase === "standby" && goalState.round.betChosen;
}

function CanRandom() {
    return goalState.round.phase === "playing";
}

function CanCashout() {
    return (
        goalState.round.phase === "playing" &&
        goalState.round.clearedColumns > 0
    );
}

function Play(balance: number, unit: number): GoalPlayResult {
    const round = goalState.round;
    if (round.phase !== "standby" || !round.betChosen) {
        goalState.error = goalErrorCode("state");
        return { ok: false, round };
    }

    if (balance < round.betLevel) {
        goalState.error = goalErrorCode("balance");
        return { ok: false, round };
    }

    const playing = {
        phase: "playing" as const,
        betLevel: round.betLevel,
        column: 0,
        clearedColumns: 0,
        cashoutAmount: 0,
        trapSlot: RandomSlot(unit),
        cleared: [],
    };
    goalState.error = null;
    goalState.round = playing;
    syncCells();
    goalEvents.emit(GOAL_EVENT_NAMES.PLAY_STARTED, playing);
    return { ok: true, round: playing, stake: round.betLevel };
}

function Pick(slot: number, nextUnit: number): GoalPickResult {
    const round = goalState.round;
    if (
        round.phase !== "playing" ||
        slot < 0 ||
        slot >= GOAL_SLOT_COUNT ||
        !Number.isInteger(slot)
    ) {
        goalState.error = goalErrorCode("slot");
        return { round, cashedOut: 0, lost: false };
    }

    if (slot === round.trapSlot) {
        const result: GoalPickResult = {
            cashedOut: 0,
            lost: true,
            round: standby(round.betLevel),
        };
        syncCells({ column: round.column, slot });
        goalEvents.emit(GOAL_EVENT_NAMES.PICK_RESOLVED, result);
        return result;
    }

    const amount = cashoutForClearedColumn(round.betLevel, round.column);
    const clearedColumns = round.clearedColumns + 1;

    if (clearedColumns >= GOAL_COLUMN_COUNT) {
        const result: GoalPickResult = {
            cashedOut: amount,
            lost: false,
            round: standby(round.betLevel),
        };
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
        trapSlot: RandomSlot(nextUnit),
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
    if (!CanCashout() || goalState.round.phase !== "playing") {
        goalState.error = goalErrorCode("state");
        return { round: goalState.round, cashedOut: 0, lost: false };
    }

    return payOut(GOAL_EVENT_NAMES.CASHOUT);
}

function TakeCashout(): GoalPickResult {
    if (goalState.round.phase !== "playing") {
        return { round: goalState.round, cashedOut: 0, lost: false };
    }

    return payOut(GOAL_EVENT_NAMES.CASHOUT);
}

function ApplyRound(round: GoalRound) {
    goalState.error = null;
    goalState.round = round;
    syncCells();
    goalEvents.emit(GOAL_EVENT_NAMES.STANDBY, goalState.round);
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
    goalEvents.emit(event, result);
    return result;
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

function syncCells(boom?: GoalSlotPick) {
    const round = goalState.round;
    const faces = blankFaces();

    if (round.phase === "playing") {
        for (const mark of round.cleared) {
            faces[mark.column][mark.slot] = "bullet";
        }

        for (let slot = 0; slot < GOAL_SLOT_COUNT; slot += 1) {
            if (faces[round.column][slot] === "normal") {
                faces[round.column][slot] = "active";
            }
        }
    }

    if (boom) faces[boom.column][boom.slot] = "explode";
    goalState.cells = faces;
}

function blankFaces(): GoalCellFace[][] {
    return Array.from({ length: GOAL_COLUMN_COUNT }, () =>
        Array.from({ length: GOAL_SLOT_COUNT }, (): GoalCellFace => "normal"),
    );
}

syncCells();
