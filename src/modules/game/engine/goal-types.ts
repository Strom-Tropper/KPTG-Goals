export type GoalSlotPick = {
    column: number;
    slot: number;
};

export type GoalStandby = {
    phase: "standby";
    betLevel: number;
    betChosen: boolean;
};

export type GoalPlaying = {
    phase: "playing";
    betLevel: number;
    column: number;
    clearedColumns: number;
    cashoutAmount: number;
    trapSlot: number;
    cleared: GoalSlotPick[];
};

export type GoalRound = GoalStandby | GoalPlaying;

export type GoalPlayResult =
    | { ok: false; round: GoalRound }
    | { ok: true; round: GoalPlaying; stake: number };

export type GoalPickResult = {
    round: GoalRound;
    cashedOut: number;
    lost: boolean;
};

export type GoalCellFace =
    | "normal"
    | "active"
    | "explode"
    | "bullet"
    | "ball"
    | "bomb";
