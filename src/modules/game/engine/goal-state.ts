import { GOAL_BET_LEVELS, GOAL_TURN_MS, type GoalErrorCode } from "./goal-constants";
import type { GoalCellFace, GoalRound } from "./goal-types";

type GoalState = {
    round: GoalRound;
    cells: GoalCellFace[][];
    error: GoalErrorCode | null;
    presentationLocked: boolean;
    betListOpen: boolean;
    secondsLeft: number | null;
};

export const goalState: GoalState = {
    round: {
        phase: "standby",
        betLevel: GOAL_BET_LEVELS[0],
        betChosen: false,
    },
    cells: [],
    error: null,
    presentationLocked: false,
    betListOpen: false,
    secondsLeft: GOAL_TURN_MS / 1000,
};
