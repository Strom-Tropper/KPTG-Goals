export type GoalSlotPick = {
    column: number;
    slot: number;
};

export type GoalStandby = {
    phase: "standby";
    betLevel: number;
    betChosen: boolean;
    column?: number;
};

export type GoalPlaying = {
    phase: "playing";
    betLevel: number;
    column: number;
    clearedColumns: number;
    cashoutAmount: number;
    traps: number[];
    cleared: GoalSlotPick[];
};

export type GoalEnded = {
    phase: "ended";
    betLevel: number;
    betChosen: boolean;
    column: number;
    clearedColumns: number;
};

export type GoalRound = GoalStandby | GoalPlaying | GoalEnded;

export type GoalPlayResult =
    | { ok: false; round: GoalRound }
    | { ok: true; round: GoalPlaying; stake: number };

export type GoalPickResult = {
    round: GoalRound;
    cashedOut: number;
    lost: boolean;
};

export type GoalCellTile = "normal" | "active" | "explode";

export type GoalCellMark = "none" | "ball" | "bomb" | "bullet" | "explode";

export type GoalCellFace = {
    tile: GoalCellTile;
    mark: GoalCellMark;
};
