/* eslint-disable @typescript-eslint/no-explicit-any */

import { EVENT_NAMES, eventBus } from "../engine/game.events";
import { GAME_ERROR_CODES, getErrorMessage } from "../engine/game.errors";
import { RES_ERROR } from "../engine/game.constants";

// =========================================================
// TYPES
// =========================================================
type SocketListeners = {
    [opcode: number]: Array<(data: any) => void>;
};

type SystemHooks = {
    onConnect?: () => void;
    onDisconnect?: (reason: string) => void;
    onError?: (error: Event) => void;
};

// =========================================================
// PRIVATE STATE - MODULE-LEVEL SINGLETON
// =========================================================
let socket: WebSocket | null = null;
let endpoint: string = "";
let currentMode: "demo" | "real" = "real";

let isConnected: boolean = false;
let manualClose: boolean = false;
let shouldPreventReconnect: boolean = false;
let hasConnectedBefore: boolean = false;

const listeners: SocketListeners = {};
let systemHooks: SystemHooks = {};

// Auto Reconnect
let reconnectAttempts: number = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectTimer: number | null = null;
let hasReportedConnectionFailure: boolean = false;
let systemCloseErrorKey: string | null = null;

const SYSTEM_CODE_ERROR = [415, 403, 411, 199, 401];
// =========================================================
// PRIVATE FUNCTIONS
// =========================================================
const getSystemErrorKey = (code: number) => {
    if (code === 403) return GAME_ERROR_CODES.MAINTENANCE;
    if (code === 401) return GAME_ERROR_CODES.INVALID_TOKEN;

    return GAME_ERROR_CODES.CONNECTION_FAILED;
};

const normalizePayload = (payload: unknown) => {
    if (typeof payload !== "string") {
        return payload;
    }

    try {
        return JSON.parse(payload);
    } catch {
        return payload;
    }
};

const handleIncomingMessage = (rawData: string) => {
    try {
        const parsed = JSON.parse(rawData) as {
            c?: number;
            data?: any;
            code?: number;
            message?: string;
            [key: string]: any;
        };
        const opcode = parsed.c ?? parsed.code;

        if (opcode === undefined) {
            console.warn("[WS] Received packet without opcode.", parsed);
            return;
        }

        if (opcode === RES_ERROR || parsed.code === RES_ERROR) {
            eventBus.emit(EVENT_NAMES.SPIN_CANCELLED, undefined);
        }

        // Handle token conflict / forbidden session
        if (parsed.code && SYSTEM_CODE_ERROR.includes(parsed.code)) {
            const errorKey = getSystemErrorKey(parsed.code);
            eventBus.emit(EVENT_NAMES.ERROR_OCCURRED, {
                errorKey,
                errorMessage: getErrorMessage(errorKey, parsed.message),
                rawError: parsed,
                canHide: true,
            });
            shouldPreventReconnect = true;
            systemCloseErrorKey = errorKey;
            socket?.close();
            return;
        }

        // Reset reconnect counter on successful first-load
        if (opcode === 100) {
            reconnectAttempts = 0;
            hasReportedConnectionFailure = false;
        }

        if (listeners[opcode]) {
            const payload = normalizePayload(parsed.data ?? parsed);
            listeners[opcode].forEach((cb) => cb(payload));
        } else {
            console.warn(
                `[WS] Received opcode ${opcode} but no listener registered.`,
            );
        }
    } catch (_error) {
        console.error("[WS] JSON parse error:", rawData);
    }
};

const reportConnectionFailure = () => {
    if (hasReportedConnectionFailure) return;

    hasReportedConnectionFailure = true;
    console.error(
        "[WS] Connection lost completely. Maximum reconnect attempts exceeded.",
    );
    systemHooks.onError?.(new Event("Max reconnect attempts reached"));
    eventBus.emit(EVENT_NAMES.ERROR_OCCURRED, {
        errorKey: GAME_ERROR_CODES.CONNECTION_FAILED,
        errorMessage: getErrorMessage(GAME_ERROR_CODES.CONNECTION_FAILED),
        rawError: {
            type: "closed",
            errc: GAME_ERROR_CODES.CONNECTION_FAILED,
        },
        canHide: false,
    });
};

const attemptAutoReconnect = () => {
    if (manualClose || shouldPreventReconnect) return;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        reportConnectionFailure();
        return;
    }

    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);

    eventBus.emit(EVENT_NAMES.ERROR_OCCURRED, {
        errorKey: GAME_ERROR_CODES.CONNECTING,
        errorMessage: getErrorMessage(GAME_ERROR_CODES.CONNECTING),
        rawError: {
            type: "reconnecting",
            attempt: reconnectAttempts,
            maxAttempts: MAX_RECONNECT_ATTEMPTS,
        },
        canHide: false,
    });

    console.warn(
        `[WS] Attempting to reconnect (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`,
    );

    reconnectTimer = window.setTimeout(async () => {
        reconnectTimer = null;
        try {
            await createConnection();
        } catch {
            // `error` is not guaranteed to be followed by `close` in every
            // environment, so evaluate the retry limit here as well.
            attemptAutoReconnect();
        }
    }, delay);
};

const handleClose = (event: CloseEvent) => {
    isConnected = false;
    eventBus.emit(EVENT_NAMES.SOCKET_CLOSED, {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
    });

    if (!manualClose && !shouldPreventReconnect) {
        if (reconnectAttempts === 0 && systemHooks.onDisconnect) {
            systemHooks.onDisconnect(
                `Code: ${event.code}, Reason: ${event.reason}`,
            );
        }
        attemptAutoReconnect();
    }

    if (shouldPreventReconnect && !systemCloseErrorKey) {
        console.warn("[WS] Reconnection prevented due to token conflict");
        eventBus.emit(EVENT_NAMES.ERROR_OCCURRED, {
            errorKey: GAME_ERROR_CODES.CONNECTION_FAILED,
            errorMessage: getErrorMessage(GAME_ERROR_CODES.CONNECTION_FAILED),
            rawError: {
                type: "closed",
                errc: GAME_ERROR_CODES.CONNECTION_FAILED,
            },
            canHide: false,
        });
    }
};

const getConnectionMode = (token?: string | null): "demo" | "real" => {
    return token ? "real" : "demo";
};

export const isDemoMode = (): boolean => currentMode === "demo";

const buildEndpoint = (url: string, token?: string | null): string => {
    const isDemo = !token;
    const finalToken = token ? token : `demo-${crypto.randomUUID()}`;

    const urlParams = new URLSearchParams(window.location.search);
    const extra = new URLSearchParams();

    extra.set("token", finalToken);

    extra.set(
        "gameId",
        urlParams.get("gameId") || import.meta.env.VITE_GAME_ID || "",
    );
    extra.set(
        "walletProvider",
        urlParams.get("walletProvider") ||
            import.meta.env.VITE_WALLET_PROVIDER ||
            "",
    );
    extra.set(
        "walletPlatformId",
        isDemo
            ? "demo"
            : urlParams.get("walletPlatformId") ||
                  import.meta.env.VITE_POINTS_PLATFORM_ID ||
                  "",
    );
    extra.set(
        "walletResource",
        urlParams.get("walletResource") ||
            import.meta.env.VITE_WALLET_RESOURCE ||
            "",
    );

    const extraStr = extra.toString();
    return url.includes("?") ? `${url}&${extraStr}` : `${url}?${extraStr}`;
};

// Setup network / visibility monitors (called once at module load)
const setupNetworkMonitors = () => {
    if (typeof window === "undefined") return;

    window.addEventListener("offline", () => {
        console.warn("[WS] Browser Offline");
        eventBus.emit(EVENT_NAMES.ERROR_OCCURRED, {
            errorKey: GAME_ERROR_CODES.CONNECTION_FAILED,
            errorMessage: getErrorMessage(GAME_ERROR_CODES.CONNECTION_FAILED),
            rawError: {
                type: "offline",
                errc: GAME_ERROR_CODES.CONNECTION_FAILED,
            },
            canHide: false,
        });
        if (socket) socket.close();
    });

    window.addEventListener("online", () => {
        console.warn("[WS] Browser Online restored");
        if (!isConnected && !manualClose && !shouldPreventReconnect) {
            reconnectAttempts = 0;
            attemptAutoReconnect();
        }
    });
};

setupNetworkMonitors();

// =========================================================
// PRIVATE: raw connection using stored endpoint
// =========================================================
const createConnection = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!navigator.onLine) {
            reject(new Error("Offline"));
            return;
        }

        if (socket && socket.readyState === WebSocket.OPEN) {
            resolve();
            return;
        }

        try {
            socket = new WebSocket(endpoint);
        } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
            return;
        }

        let isHandled = false;

        socket.onopen = () => {
            isConnected = true;
            const isReconnect = hasConnectedBefore;
            hasConnectedBefore = true;

            console.warn("[WS] Connected");
            eventBus.emit(EVENT_NAMES.SOCKET_CONNECTED, { isReconnect });

            if (systemHooks.onConnect) systemHooks.onConnect();

            if (!isHandled) {
                isHandled = true;
                resolve();
            }
        };

        socket.onmessage = (event: MessageEvent) =>
            handleIncomingMessage(event.data);

        socket.onclose = (event: CloseEvent) => {
            handleClose(event);
            if (!isHandled) {
                isHandled = true;
                reject(new Error("WebSocket closed before opening"));
            }
        };

        socket.onerror = (_event: Event) => {
            if (!isHandled) {
                isHandled = true;
                reject(new Error("WebSocket connection failed"));
            }
        };
    });
};

// =========================================================
// PUBLIC API
// =========================================================
const connect = (url: string, token?: string): Promise<void> => {
    // Build endpoint once — reconnect reuses stored endpoint via createConnection()
    currentMode = getConnectionMode(token);
    endpoint = buildEndpoint(url, token);
    manualClose = false;
    shouldPreventReconnect = false;
    systemCloseErrorKey = null;
    reconnectAttempts = 0;
    hasReportedConnectionFailure = false;
    hasConnectedBefore = false;
    return createConnection();
};

const disconnect = (): void => {
    manualClose = true;
    isConnected = false;

    if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.onopen = null;
        socket.close();
        socket = null;
    }
};

const send = (
    opcode: number,
    data: any = null,
    rootParams: Record<string, any> = {},
): boolean => {
    if (!isConnected || !socket || socket.readyState !== WebSocket.OPEN) {
        console.warn(`[WS] Cannot send opcode ${opcode}: Not connected.`);
        return false;
    }

    const payload: Record<string, any> = { c: opcode, ...rootParams };

    if (data !== null && data !== undefined && Object.keys(data).length > 0) {
        payload.data = data;
    }

    socket.send(JSON.stringify(payload));
    return true;
};

const on = (opcode: number, callback: (data: any) => void): void => {
    if (!listeners[opcode]) listeners[opcode] = [];
    listeners[opcode].push(callback);
};

const off = (opcode: number, callback: (data: any) => void): void => {
    if (!listeners[opcode]) return;
    listeners[opcode] = listeners[opcode].filter((cb) => cb !== callback);
};

const setSystemHooks = (hooks: SystemHooks): void => {
    systemHooks = hooks;
};

const isReady = (): boolean => {
    return isConnected && socket?.readyState === WebSocket.OPEN;
};

// =========================================================
// EXPORTS
// =========================================================
export const socketClient = {
    connect,
    disconnect,
    send,
    on,
    off,
    setSystemHooks,
    isReady,
};

// Backward-compat export so main.ts doesn't need major changes
export const WebSocketConnect = (url: string, token?: string) =>
    socketClient.connect(url, token);
