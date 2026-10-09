// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (payload: any) => void;

const listeners: Record<string, EventHandler[]> = {};
const replayablePayloads: Record<string, unknown> = {};

const isReplayableEvent = (event: string): boolean =>
    event === EVENT_NAMES.INITIAL_LOAD_RESPONSE ||
    event === EVENT_NAMES.GET_JACKPOT_VALUES_RESPONSE;

export const EVENT_NAMES = {
    INITIAL_LOAD_RESPONSE: "INITIAL_LOAD_RESPONSE",
    SPIN_RESULT_RESPONSE: "SPIN_RESULT_RESPONSE",
    BALANCE_UPDATE_RESPONSE: "BALANCE_UPDATE_RESPONSE",
    GET_JACKPOT_VALUES_RESPONSE: "GET_JACKPOT_VALUES_RESPONSE",
    JACKPOT_REELS_STOPPED: "JACKPOT_REELS_STOPPED",
    JACKPOT_ANIMATION_COMPLETED: "JACKPOT_ANIMATION_COMPLETED",
    WIN_POPUP_REELS_STOPPED: "WIN_POPUP_REELS_STOPPED",
    WIN_POPUP_ANIMATION_COMPLETED: "WIN_POPUP_ANIMATION_COMPLETED",
    BETTING_HISTORY_RESPONSE: "BETTING_HISTORY_RESPONSE",
    JACKPOT_HISTORY_RESPONSE: "JACKPOT_HISTORY_RESPONSE",
    ERROR_OCCURRED: "ERROR_OCCURRED",
    BET_LEVEL_CHANGED: "BET_LEVEL_CHANGED",
    SPIN_BUTTON_PRESSED: "SPIN_BUTTON_PRESSED",
    SPIN_REQUEST: "SPIN_REQUEST",
    SPIN_CANCELLED: "SPIN_CANCELLED",
    SPIN_STATE_CHANGED: "SPIN_STATE_CHANGED",
    WIN_PRESENTED: "WIN_PRESENTED",
    AUTO_SPIN_CHANGED: "AUTO_SPIN_CHANGED",
    AUTO_SPIN_REMAINING_CHANGED: "AUTO_SPIN_REMAINING_CHANGED",
    WALLET_SWITCH_LOCK_CHANGED: "WALLET_SWITCH_LOCK_CHANGED",
    TURBO_CHANGED: "TURBO_CHANGED",
    SYMBOL_DETAIL_REQUESTED: "SYMBOL_DETAIL_REQUESTED",
    SYMBOL_DETAIL_CLOSED: "SYMBOL_DETAIL_CLOSED",
    GAME_STATUS_CHANGED: "GAME_STATUS_CHANGED",
    RADIAL_REELS_STOPPED: "RADIAL_REELS_STOPPED",
    RADIAL_WIN_LINES_SHOWN: "RADIAL_WIN_LINES_SHOWN",
    WIN_LINE_ANIMATION_STARTED: "WIN_LINE_ANIMATION_STARTED",
    WIN_LINE_ANIMATION_COMPLETED: "WIN_LINE_ANIMATION_COMPLETED",
    WIN_AMOUNT_ANIMATION_STARTED: "WIN_AMOUNT_ANIMATION_STARTED",
    WIN_AMOUNT_ANIMATION_COMPLETED: "WIN_AMOUNT_ANIMATION_COMPLETED",
    RADIAL_FEATURE_SYMBOLS_SHOWN: "RADIAL_FEATURE_SYMBOLS_SHOWN",
    RADIAL_SPECIAL_STATES_SHOWN: "RADIAL_SPECIAL_STATES_SHOWN",
    MINIGAME_STARTED: "MINIGAME_STARTED",
    MINIGAME_UPDATED: "MINIGAME_UPDATED",
    MINIGAME_ENDED: "MINIGAME_ENDED",
    BONUS_GAME_STARTED: "BONUS_GAME_STARTED",
    BONUS_GAME_ENDED: "BONUS_GAME_ENDED",
    PRESENTATION_LOCK_CHANGED: "PRESENTATION_LOCK_CHANGED",

    // WebSocket events
    SOCKET_CONNECTED: "SOCKET_CONNECTED",
    SOCKET_CLOSED: "SOCKET_CLOSED",

    // keyboard events
    CASHOUT_REQUEST_KEYBOARD: "CASHOUT_REQUEST_KEYBOARD",
    BET_INCREASE_KEYBOARD: "BET_INCREASE_KEYBOARD",
    BET_DECREASE_KEYBOARD: "BET_DECREASE_KEYBOARD",

    // audio events
    AUDIO_BUTTON_OTHER_CLICKED: "AUDIO_BUTTON_OTHER_CLICKED",
    AUDIO_PAGE_CHANGED: "AUDIO_PAGE_CHANGED",
    AUDIO_REEL_STOPPED: "AUDIO_REEL_STOPPED",
    AUDIO_REELS_STOPPED: "AUDIO_REELS_STOPPED",
    AUDIO_WIN_LOW: "AUDIO_WIN_LOW",
    AUDIO_WIN_HIGH: "AUDIO_WIN_HIGH",
    AUDIO_WINLINE_SHOWN: "AUDIO_WINLINE_SHOWN",
    AUDIO_WILD_WIN_SHOWN: "AUDIO_WILD_WIN_SHOWN",
    AUDIO_WIN_AMOUNT_STARTED: "AUDIO_WIN_AMOUNT_STARTED",
    AUDIO_WIN_AMOUNT_STOPPED: "AUDIO_WIN_AMOUNT_STOPPED",
    AUDIO_BIGWIN_AMOUNT_STARTED: "AUDIO_BIGWIN_AMOUNT_STARTED",
    AUDIO_BIGWIN_AMOUNT_STOPPED: "AUDIO_BIGWIN_AMOUNT_STOPPED",
    AUDIO_BIGWIN_POPUP_SHOWN: "AUDIO_BIGWIN_POPUP_SHOWN",
    AUDIO_JACKPOT_SHOWN: "AUDIO_JACKPOT_SHOWN",
    AUDIO_BONUS_WIN_POPUP_SHOWN: "AUDIO_BONUS_WIN_POPUP_SHOWN",
    AUDIO_BONUS_LOSE_POPUP_SHOWN: "AUDIO_BONUS_LOSE_POPUP_SHOWN",
};

export const eventBus = {
    on(event: string, cb: EventHandler) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);

        if (isReplayableEvent(event) && event in replayablePayloads) {
            cb(replayablePayloads[event]);
        }

        return () => {
            this.off(event, cb);
        };
    },

    off(event: string, cb: EventHandler) {
        listeners[event] = listeners[event]?.filter(
            (listener) => listener !== cb,
        );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emit(event: string, payload: any) {
        if (isReplayableEvent(event)) {
            replayablePayloads[event] = payload;
        }

        listeners[event]?.forEach((cb) => cb(payload));
    },
};

type GoalEventHandler = (payload: unknown) => void;

const goalListeners: Record<string, GoalEventHandler[]> = {};

export const GOAL_EVENT_NAMES = {
    BET_LEVEL_CHANGED: "BET_LEVEL_CHANGED",
    PLAY_STARTED: "PLAY_STARTED",
    PICK_RESOLVED: "PICK_RESOLVED",
    CASHOUT: "CASHOUT",
    STANDBY: "STANDBY",
    ERROR: "ERROR",
    PRESENTATION_LOCK_CHANGED: "PRESENTATION_LOCK_CHANGED",
    BET_LIST_CHANGED: "BET_LIST_CHANGED",
    SECONDS_CHANGED: "SECONDS_CHANGED",
    SCREEN: "SCREEN",
};

export const goalEvents = {
    on(event: string, cb: GoalEventHandler) {
        goalListeners[event] = goalListeners[event] || [];
        goalListeners[event].push(cb);

        return () => {
            this.off(event, cb);
        };
    },

    off(event: string, cb: GoalEventHandler) {
        goalListeners[event] = goalListeners[event]?.filter(
            (listener) => listener !== cb,
        );
    },

    emit(event: string, payload: unknown) {
        goalListeners[event]?.forEach((cb) => cb(payload));
    },
};
