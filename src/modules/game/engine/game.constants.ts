/* ===============================
   RESPONSE CODES (BE -> FE)
================================ */

export const RES_FIRST_LOAD = 100;
export const RES_SPIN = 101;
export const RES_MAIN_BALANCE_UPDATE = 102;
// export const RES_MINIGAME = 104;
// export const RES_JACKPOT_VALUES = 110;
export const RES_BALANCE_UPDATE = 196;
export const RES_ERROR = 199;
// export const RES_JACKPOT_HISTORY = 451;
// export const RES_BET_HISTORY = 452;

/* ===============================
   REQUEST CODES (FE -> BE)
================================ */

export const REQ_SPIN = 202;
export const REQ_MINIGAME_PICK = 203;
export const REQ_RANDOM = 204;
export const REQ_CASHOUT = 205;
// export const REQ_STATE = 206;
export const RES_STATE = 206;
// export const REQ_JACKPOT_VALUES = 110;
// export const REQ_CHANGE_WALLET = 208;
// export const REQ_JACKPOT_HISTORY = 401;
// export const REQ_BET_HISTORY = 402;
// export const REQ_CONFIRM_SESSION = 210;

/* ===============================
   BETTING
================================ */

/* Mức bet của bàn là GOAL_BET_LEVELS phía dưới. Slot còn đọc danh sách đó khi gói 100 không có betting. */

// export const FALLBACK_TOTAL_BET_LEVELS = [
//     10000, 20000, 50000, 100000, 200000, 500000, 1000000,
// ] as const;
// export const FALLBACK_BET_LEVEL_DIVISOR = 10;

/* ===============================
   ERROR CODES
================================ */

export const GAME_ERROR_CODES = {
    CONNECTING: "CONNECTING",
    CONNECTION_FAILED: "CONNECTION_FAILED",
    MAINTENANCE: "MAINTENANCE",
    INVALID_BET_LEVEL: "INVALID_BET_LEVEL",
    ACTIVE_ROUND_EXISTS: "ACTIVE_ROUND_EXISTS",
    INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
    INVALID_STATE: "INVALID_STATE",
    INVALID_TOKEN: "INVALID_TOKEN",
    NO_ACTIVE_SESSION: "NO_ACTIVE_SESSION",
    TOKEN_CONFLICT: "TOKEN_CONFLICT",
    SESSION_EXPIRED: "SESSION_EXPIRED",
    ANOTHER_LOGIN: "ANOTHER_LOGIN",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    PAYMENT_FAILED: "PAYMENT_FAILED",
    BET_FAILED: "BET_FAILED",
    WIN_FAILED: "WIN_FAILED",
    SESSION_CONFLICT: "SESSION_CONFLICT",
    LOGIN_REQUIRED: "LOGIN_REQUIRED",
    GOODBYE: "GOODBYE",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type GameErrorCode =
    (typeof GAME_ERROR_CODES)[keyof typeof GAME_ERROR_CODES];

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
