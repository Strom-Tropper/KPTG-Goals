/* ===============================
   BOARD
================================ */

export const GOAL_COLUMN_COUNT = 7;
export const GOAL_SLOT_COUNT = 4;
export const GOAL_TURN_MS = 30_000;

/* ===============================
   BETTING
================================ */

export const GOAL_BET_LEVELS = [
    10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000,
] as const;

export const GOAL_STEP_MULTIPLIERS = [
    1.29, 1.72, 2.29, 3.06, 4.08, 5.45, 7.26,
] as const;

/* ===============================
   ERROR CODES
================================ */

export const GOAL_ERROR_CODES = {
    INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
    INVALID_STATE: "INVALID_STATE",
    INVALID_SLOT: "INVALID_SLOT",
} as const;

export type GoalErrorCode =
    (typeof GOAL_ERROR_CODES)[keyof typeof GOAL_ERROR_CODES];

export function goalMultiplierText(column: number): string {
    return `${GOAL_STEP_MULTIPLIERS[column].toFixed(2)}x`;
}
