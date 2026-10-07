import { i18n } from "@/shared/i18n/I18nManager";
import { GAME_ERROR_CODES, type GameErrorCode } from "./game.constants";

export { GAME_ERROR_CODES };
export type { GameErrorCode };

const SERVER_ERROR_CODE_MAP: Record<string, GameErrorCode> = {
    "1": GAME_ERROR_CODES.INVALID_BET_LEVEL,
    "2": GAME_ERROR_CODES.ACTIVE_ROUND_EXISTS,
    "3": GAME_ERROR_CODES.INSUFFICIENT_BALANCE,
    "4": GAME_ERROR_CODES.INVALID_STATE,
    "8": GAME_ERROR_CODES.NO_ACTIVE_SESSION,
    "90": GAME_ERROR_CODES.PAYMENT_FAILED,
    "91": GAME_ERROR_CODES.BET_FAILED,
    "99": GAME_ERROR_CODES.INTERNAL_ERROR,
    "106": GAME_ERROR_CODES.INVALID_TOKEN,
    "112": GAME_ERROR_CODES.SESSION_CONFLICT,
    "113": GAME_ERROR_CODES.TOKEN_CONFLICT,
    "114": GAME_ERROR_CODES.SESSION_EXPIRED,
    "117": GAME_ERROR_CODES.LOGIN_REQUIRED,
    "403": GAME_ERROR_CODES.MAINTENANCE,
};

export function normalizeGameErrorCode(errorCode?: string | number): string {
    if (errorCode === undefined || errorCode === null) {
        return GAME_ERROR_CODES.UNKNOWN_ERROR;
    }

    const normalizedCode = String(errorCode);

    return SERVER_ERROR_CODE_MAP[normalizedCode] ?? normalizedCode;
}

type LocalizedGameErrorCode = Exclude<
    GameErrorCode,
    typeof GAME_ERROR_CODES.UNKNOWN_ERROR
>;

const ERROR_MESSAGE_KEYS: Record<string, string> = {
    [GAME_ERROR_CODES.CONNECTING]: "errors.server.CONNECTING",
    [GAME_ERROR_CODES.CONNECTION_FAILED]: "errors.server.CONNECTION_FAILED",
    [GAME_ERROR_CODES.INVALID_BET_LEVEL]: "errors.server.INVALID_BET_LEVEL",
    [GAME_ERROR_CODES.ACTIVE_ROUND_EXISTS]: "errors.server.ACTIVE_ROUND_EXISTS",
    [GAME_ERROR_CODES.INSUFFICIENT_BALANCE]:
        "errors.server.INSUFFICIENT_BALANCE",
    [GAME_ERROR_CODES.INVALID_STATE]: "errors.server.INVALID_STATE",
    [GAME_ERROR_CODES.INVALID_TOKEN]: "errors.server.INVALID_TOKEN",
    [GAME_ERROR_CODES.NO_ACTIVE_SESSION]: "errors.server.NO_ACTIVE_SESSION",
    [GAME_ERROR_CODES.TOKEN_CONFLICT]: "errors.server.TOKEN_CONFLICT",
    [GAME_ERROR_CODES.SESSION_EXPIRED]: "errors.server.SESSION_EXPIRED",
    [GAME_ERROR_CODES.ANOTHER_LOGIN]: "errors.server.ANOTHER_LOGIN",
    [GAME_ERROR_CODES.INTERNAL_ERROR]: "errors.server.INTERNAL_ERROR",
    [GAME_ERROR_CODES.PAYMENT_FAILED]: "errors.server.PAYMENT_FAILED",
    [GAME_ERROR_CODES.BET_FAILED]: "errors.server.BET_FAILED",
    [GAME_ERROR_CODES.WIN_FAILED]: "errors.server.WIN_FAILED",
    [GAME_ERROR_CODES.SESSION_CONFLICT]: "errors.server.SESSION_CONFLICT",
    [GAME_ERROR_CODES.LOGIN_REQUIRED]: "errors.server.LOGIN_REQUIRED",
    [GAME_ERROR_CODES.GOODBYE]: "errors.server.GOODBYE",
    [GAME_ERROR_CODES.MAINTENANCE]: "errors.server.MAINTENANCE",
} satisfies Record<LocalizedGameErrorCode, string>;

export function getErrorMessage(
    errorKey?: string,
    fallbackMessage?: string,
): string {
    if (errorKey === undefined) {
        return fallbackMessage || i18n.t("errors.server.unexpected");
    }

    const messageKey = ERROR_MESSAGE_KEYS[errorKey];

    return messageKey
        ? i18n.t(messageKey)
        : fallbackMessage ||
              i18n.t("errors.server.unknown", { code: errorKey });
}
