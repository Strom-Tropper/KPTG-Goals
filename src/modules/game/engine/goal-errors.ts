import { GOAL_ERROR_CODES, type GoalErrorCode } from "./goal-constants";

export { GOAL_ERROR_CODES };
export type { GoalErrorCode };

export function goalErrorCode(
    reason: "balance" | "state" | "slot",
): GoalErrorCode {
    if (reason === "balance") return GOAL_ERROR_CODES.INSUFFICIENT_BALANCE;
    if (reason === "slot") return GOAL_ERROR_CODES.INVALID_SLOT;
    return GOAL_ERROR_CODES.INVALID_STATE;
}
