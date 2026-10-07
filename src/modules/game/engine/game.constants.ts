/* ===============================
   RESPONSE CODES (BE -> FE)
================================ */

export const RES_FIRST_LOAD = 100;
export const RES_SPIN = 101;
export const RES_MAIN_BALANCE_UPDATE = 102;
export const RES_MINIGAME = 104;
export const RES_JACKPOT_VALUES = 110;
export const RES_BALANCE_UPDATE = 196;
export const RES_ERROR = 199;
export const RES_JACKPOT_HISTORY = 451;
export const RES_BET_HISTORY = 452;

/* ===============================
   REQUEST CODES (FE -> BE)
================================ */

export const REQ_SPIN = 202;
export const REQ_MINIGAME_PICK = 203;
export const REQ_JACKPOT_VALUES = 110;
export const REQ_CHANGE_WALLET = 208;
export const REQ_JACKPOT_HISTORY = 401;
export const REQ_BET_HISTORY = 402;
export const REQ_CONFIRM_SESSION = 210;

/* ===============================
   BETTING
================================ */

export const FALLBACK_TOTAL_BET_LEVELS = [
    10000, 20000, 50000, 100000, 200000, 500000, 1000000,
] as const;
export const FALLBACK_BET_LEVEL_DIVISOR = 10;

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
