type EventHandler = (payload: unknown) => void;

const listeners: Record<string, EventHandler[]> = {};

export const GOAL_EVENT_NAMES = {
    BET_LEVEL_CHANGED: "BET_LEVEL_CHANGED",
    PLAY_STARTED: "PLAY_STARTED",
    PICK_RESOLVED: "PICK_RESOLVED",
    CASHOUT: "CASHOUT",
    STANDBY: "STANDBY",
    ERROR: "ERROR",
};

export const goalEvents = {
    on(event: string, cb: EventHandler) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);

        return () => {
            this.off(event, cb);
        };
    },

    off(event: string, cb: EventHandler) {
        listeners[event] = listeners[event]?.filter(
            (listener) => listener !== cb,
        );
    },

    emit(event: string, payload: unknown) {
        listeners[event]?.forEach((cb) => cb(payload));
    },
};
