import { GOAL_BET_LEVELS, type GoalErrorCode } from "./goal-constants";
import type { GoalCellFace, GoalRound } from "./goal-types";

type GoalState = {
    round: GoalRound;
    cells: GoalCellFace[][];
    error: GoalErrorCode | null;
};

export const goalState: GoalState = {
    round: {
        phase: "standby",
        betLevel: GOAL_BET_LEVELS[GOAL_BET_LEVELS.length - 1],
        betChosen: false,
    },
    cells: [],
    error: null,
};
