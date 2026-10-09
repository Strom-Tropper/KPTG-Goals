import { GOAL_COLUMN_COUNT, GOAL_SLOT_COUNT, GOAL_TURN_MS } from "./game.constants";
import { GOAL_EVENT_NAMES, goalEvents } from "./game.events";
import { goalState } from "./game.state";
import type {
    GoalCellFace,
    GoalCellMark,
    GoalCellTile,
    GoalConnectState,
    GoalErrorFrame,
    GoalGameConfig,
    GoalPlaying,
    GoalStatusFrame,
    GoalWireFinished,
    GoalWireOpen,
    GoalWireTurn,
} from "./game.types";

let heldTicket: string | null = null;
let heldOrdinal: number | null = null;
let heldTurns: GoalWireTurn[] = [];

export const goalSession = {
    applyConnect,
    applySnapshot,
    applyFrame,
    applyError,
    note,
};

function applyConnect(packet: GoalConnectState) {
    if (!packet || (packet.game_config === undefined && !isSnapshot(packet.state))) {
        return;
    }

    if (packet.game_config) applyConfig(packet.game_config);
    applySnapshot(packet.state);
}

function applySnapshot(snapshot: GoalConnectState["state"]) {
    if (!isSnapshot(snapshot)) return;

    const mode = snapshot.state;
    if (mode === "waiting" && snapshot.open) {
        showOpen(snapshot.open, false);
        return;
    }
    if (mode === "expired" && snapshot.open) {
        showOpen(snapshot.open, true);
        return;
    }
    if (mode === "unseen" && snapshot.finished) {
        showFinished(snapshot.finished);
        return;
    }
    if (mode === "idle") showIdle();
}

function applyFrame(frame: GoalStatusFrame) {
    const board = frame?.payload?.board;
    if (!frame || !Array.isArray(board) || frame.ordinal === undefined) return;

    const ticket = frame.ticket_id ?? heldTicket ?? "";
    if (
        ticket === heldTicket &&
        heldOrdinal !== null &&
        frame.ordinal <= heldOrdinal
    ) {
        unlock();
        emitScreen();
        return;
    }

    heldTicket = ticket;
    heldOrdinal = frame.ordinal;
    goalState.answerOrdinal = frame.ordinal + 1;
    if (frame.payload?.turn) heldTurns = [...heldTurns, frame.payload.turn];

    const cleared = frame.payload?.cleared ?? 0;
    const done = frame.done === true;
    const bet = goalState.round.betLevel;
    goalState.notice = null;
    goalState.error = null;
    paintRound({
        bet,
        board,
        turns: heldTurns,
        cleared,
        currentWin: frame.payload?.current_win ?? 0,
        done,
        ending: frame.payload?.ending,
        pinkFrom: pinkColumn(frame.payload?.turn, frame.payload?.ending),
        activeColumn: done ? null : cleared,
    });
    if (done) {
        goalState.deadlineMs = null;
    } else {
        armDeadline(frame.deadline_ms);
    }
    unlock();
    emitScreen();
}

function applyError(frame: GoalErrorFrame) {
    if (!frame?.errc && !frame?.error) return;

    goalState.notice = frame.error ?? frame.errc ?? null;
    unlock();
    goalEvents.emit(GOAL_EVENT_NAMES.ERROR, goalState.notice);
}

function note(text: string | null) {
    goalState.notice = text;
    goalEvents.emit(GOAL_EVENT_NAMES.ERROR, text);
}

function showIdle() {
    heldTicket = null;
    heldOrdinal = null;
    heldTurns = [];
    goalState.answerOrdinal = null;
    goalState.deadlineMs = null;
    goalState.notice = null;
    goalState.error = null;
    if (goalState.secondsLeft === null) goalState.secondsLeft = GOAL_TURN_MS / 1000;
    const bet = goalState.ladder.some((row) => row.bet === goalState.round.betLevel)
        ? goalState.round.betLevel
        : goalState.ladder[0]?.bet ?? goalState.round.betLevel;
    goalState.round = {
        phase: "standby",
        betLevel: bet,
        betChosen: false,
    };
    goalState.cells = blankFaces();
    unlock();
    emitScreen();
}

function showOpen(open: GoalWireOpen, expired: boolean) {
    heldTicket = open.ticket_id ?? heldTicket;
    heldOrdinal = open.ordinal - 1;
    heldTurns = open.turns ?? [];
    goalState.answerOrdinal = open.ordinal;
    goalState.notice = null;
    goalState.error = null;
    paintRound({
        bet: open.bet ?? goalState.round.betLevel,
        board: open.board ?? [],
        turns: heldTurns,
        cleared: open.cleared ?? 0,
        currentWin: open.current_win ?? 0,
        done: false,
        pinkFrom: null,
        activeColumn: expired ? null : (open.cleared ?? 0),
    });
    if (expired) {
        goalState.deadlineMs = null;
        goalState.secondsLeft = null;
        goalState.presentationLocked = true;
        goalEvents.emit(GOAL_EVENT_NAMES.PRESENTATION_LOCK_CHANGED, true);
    } else {
        armDeadline(open.deadline_ms);
        unlock();
    }
    emitScreen();
}

function showFinished(finished: GoalWireFinished) {
    heldTicket = finished.ticket_id ?? null;
    heldOrdinal = null;
    heldTurns = finished.turns ?? [];
    goalState.answerOrdinal = null;
    goalState.deadlineMs = null;
    goalState.notice = null;
    goalState.error = null;
    const last = heldTurns[heldTurns.length - 1];
    paintRound({
        bet: finished.bet ?? goalState.round.betLevel,
        board: finished.board ?? [],
        turns: heldTurns,
        cleared: countCleared(heldTurns),
        currentWin: finished.win ?? 0,
        done: true,
        ending: finished.ending,
        pinkFrom: pinkColumn(last, finished.ending),
        activeColumn: null,
    });
    unlock();
    emitScreen();
}

function applyConfig(config: GoalGameConfig) {
    if (Array.isArray(config.bet_levels) && config.bet_levels.length > 0) {
        goalState.ladder = config.bet_levels.map((row) => ({
            level: String(row.level),
            bet: row.bet,
        }));
    }
    if (Array.isArray(config.multipliers_x100) && config.multipliers_x100.length > 0) {
        goalState.multipliersX100 = config.multipliers_x100;
    }
    if (config.turn_timer_seconds > 0 && goalState.deadlineMs === null) {
        goalState.secondsLeft = config.turn_timer_seconds;
    }
}

function paintRound(screen: {
    bet: number;
    board: Array<number | null>;
    turns: GoalWireTurn[];
    cleared: number;
    currentWin: number;
    done: boolean;
    ending?: string;
    pinkFrom: number | null;
    activeColumn: number | null;
}) {
    const traps = trapsFrom(screen.board);
    const clearedPicks = screen.turns.flatMap((turn) => {
        if (turn.slot === undefined || turn.trap || turn.column === undefined) return [];
        return [{ column: turn.column - 1, slot: turn.slot }];
    });
    const shownColumn = screen.done
        ? screen.pinkFrom ?? (screen.cleared > 0 ? screen.cleared - 1 : -1)
        : (screen.activeColumn ?? 0);

    if (screen.done) {
        goalState.round = {
            phase: "ended",
            betLevel: screen.bet,
            betChosen: true,
            column: shownColumn,
            clearedColumns: screen.cleared,
        };
    } else {
        const playing: GoalPlaying = {
            phase: "playing",
            betLevel: screen.bet,
            column: screen.activeColumn ?? 0,
            clearedColumns: screen.cleared,
            cashoutAmount: screen.currentWin,
            traps,
            cleared: clearedPicks,
        };
        goalState.round = playing;
    }

    goalState.cells = facesFor(
        screen.board,
        clearedPicks,
        screen.done ? null : screen.activeColumn,
        screen.pinkFrom,
    );
}

function facesFor(
    board: Array<number | null>,
    picks: { column: number; slot: number }[],
    activeColumn: number | null,
    pinkFrom: number | null,
): GoalCellFace[][] {
    const faces = blankFaces();
    const safeColumns = new Set(picks.map((pick) => pick.column));
    for (let column = 0; column < GOAL_COLUMN_COUNT; column += 1) {
        const pink = pinkFrom !== null && column >= pinkFrom;
        const mask = board[column];
        for (let slot = 0; slot < GOAL_SLOT_COUNT; slot += 1) {
            const active = activeColumn === column && !pink;
            const trap =
                !safeColumns.has(column) &&
                mask !== null &&
                mask !== undefined &&
                (mask & (1 << slot)) !== 0;
            faces[column][slot] = {
                tile: pink ? "explode" : active ? "active" : "normal",
                mark: trap ? "bomb" : "none",
            };
        }
    }

    picks.forEach((pick, index) => {
        const face = faces[pick.column]?.[pick.slot];
        if (!face) return;
        face.tile = "normal";
        face.mark = index === picks.length - 1 ? "ball" : "bullet";
    });

    if (pinkFrom !== null) {
        const trapTurn = heldTurns.find(
            (turn) => turn.trap && turn.column === pinkFrom + 1 && turn.slot !== undefined,
        );
        const face = trapTurn?.slot === undefined
            ? undefined
            : faces[pinkFrom]?.[trapTurn.slot];
        if (face) {
            face.tile = "explode";
            face.mark = "explode";
        }
    }

    return faces;
}

function pinkColumn(turn: GoalWireTurn | undefined, ending?: string) {
    if (ending !== "trap" && !turn?.trap) return null;
    if (turn?.column === undefined) return null;
    return turn.column - 1;
}

function trapsFrom(board: Array<number | null>) {
    return Array.from({ length: GOAL_COLUMN_COUNT }, (_, column) => {
        const mask = board[column];
        if (mask === null || mask === undefined) return -1;
        for (let slot = 0; slot < GOAL_SLOT_COUNT; slot += 1) {
            if ((mask & (1 << slot)) !== 0) return slot;
        }
        return -1;
    });
}

function countCleared(turns: GoalWireTurn[]) {
    return turns.filter((turn) => turn.slot !== undefined && !turn.trap).length;
}

function armDeadline(deadline: number | undefined) {
    if (deadline === undefined) {
        goalState.deadlineMs = null;
        return;
    }

    goalState.deadlineMs = deadline;
    goalState.secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

function unlock() {
    if (!goalState.presentationLocked) return;

    goalState.presentationLocked = false;
    goalEvents.emit(GOAL_EVENT_NAMES.PRESENTATION_LOCK_CHANGED, false);
}

function emitScreen() {
    goalEvents.emit(GOAL_EVENT_NAMES.SCREEN, goalState.round);
}

function isSnapshot(
    value: GoalConnectState["state"],
): value is { state?: string; open?: GoalWireOpen; finished?: GoalWireFinished } {
    return typeof value === "object" && value !== null && typeof value.state === "string";
}

function blankFaces(): GoalCellFace[][] {
    return Array.from({ length: GOAL_COLUMN_COUNT }, () =>
        Array.from({ length: GOAL_SLOT_COUNT }, () => cell("normal", "none")),
    );
}

function cell(tile: GoalCellTile, mark: GoalCellMark): GoalCellFace {
    return { tile, mark };
}
