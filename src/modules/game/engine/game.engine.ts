import { gameState, goalState } from "./game.state";
import {
    EVENT_NAMES,
    eventBus,
    GOAL_EVENT_NAMES,
    goalEvents,
} from "./game.events";
import {
    getErrorMessage,
    goalErrorCode,
    normalizeGameErrorCode,
} from "./game.errors";
import { isDemoMode } from "../ws/game.ws";
import {
    FALLBACK_BET_LEVEL_DIVISOR,
    FALLBACK_TOTAL_BET_LEVELS,
    GOAL_BET_LEVELS,
    GOAL_COLUMN_COUNT,
    GOAL_SLOT_COUNT,
    GOAL_STEP_MULTIPLIERS,
} from "./game.constants";
import {
    GoalCellFace,
    GoalCellMark,
    GoalCellTile,
    GoalPickResult,
    GoalPlayResult,
    GoalPlaying,
    GoalRound,
    GoalStandby,
    JackpotMode,
    JackpotValues,
    JourneyResponse,
    JourneyState,
    ResponseBalanceUpdateType,
    ResponseInitialLoadType,
    ResponseJackpotValuesType,
    ResponseMiniGameType,
    ResponseSpinType,
    SlotGrid,
} from "./game.types";

const configuredWalletKeys = new Set(
    (import.meta.env.VITE_WALLET_LIST || "")
        .split(",")
        .map((walletKey) => walletKey.trim())
        .filter(Boolean),
);

function filterConfiguredWallets(
    wallets: Record<string, number>,
): Record<string, number> {
    if (configuredWalletKeys.size === 0) {
        return wallets;
    }

    return Object.fromEntries(
        Object.entries(wallets).filter(([walletKey]) =>
            configuredWalletKeys.has(walletKey),
        ),
    );
}

export type GameEngine = {
    handleInitialLoadResponse(data: ResponseInitialLoadType): void;
    handleSpinResponse(data: ResponseSpinType): void;
    handleMiniGameResponse(data: ResponseMiniGameType): void;
    handleJackpotValuesResponse(data: ResponseJackpotValuesType): void;
    handleBalanceUpdateResponse(data: ResponseBalanceUpdateType): void;
    handleErrorResponse(data: { errc?: string | number; error?: string }): void;

    SetBalance(balance: number): void;
    updateWalletData(data: { wallets?: Record<string, number> }): void;
    GetActiveWalletBalance(): number;
    GetActiveWalletKey(): string | null;
    GetBalanceFromInitialLoad(data: ResponseInitialLoadType): number;
    GetBetLevel(): number;
    GetTotalBet(): number;
    GetJourney(): JourneyState;
    SetBetLevel(betLevel: number): void;
    SetTotalBet(totalBet: number): void;
    GetBetLevels(): number[];
    GetLastGrid(): SlotGrid;
    GetLastWin(): number;
    GetJackpotMode(): JackpotMode;
    GetJackpotValues(): JackpotValues;
    GetJackpotValueForBet(bet?: number): number;
    IsSpinning(): boolean;
    SetSpinning(isSpinning: boolean): void;
    IsWalletSwitchLocked(): boolean;
    SetWalletSwitchLocked(locked: boolean): void;
    IsFreeSpinActive(): boolean;
    GetFreeSpins(): number;
    IsAutoSpin(): boolean;
    SetAutoSpin(isAutoSpin: boolean): void;
    ToggleAutoSpin(): boolean;
    GetAutoSpinRemaining(): number;
    SetAutoSpinRemaining(remaining: number): void;
    DecreaseAutoSpinRemaining(): number;
    IsTurbo(): boolean;
    SetTurbo(isTurbo: boolean): void;
    ToggleTurbo(): boolean;
    IsPresentationLocked(): boolean;
    SetPresentationLocked(locked: boolean, stopAutoSpin?: boolean): void;
    PresentGameStatus(isRespin?: boolean): void;
};

export const gameEngine: GameEngine = {
    handleInitialLoadResponse,
    handleSpinResponse,
    handleMiniGameResponse,
    handleJackpotValuesResponse,
    handleBalanceUpdateResponse,
    handleErrorResponse,

    SetBalance,
    updateWalletData,
    GetActiveWalletBalance,
    GetActiveWalletKey,
    GetBalanceFromInitialLoad,
    GetBetLevel,
    GetTotalBet,
    GetJourney,
    SetBetLevel,
    SetTotalBet,
    GetBetLevels,
    GetLastGrid,
    GetLastWin,
    GetJackpotMode,
    GetJackpotValues,
    GetJackpotValueForBet,
    IsSpinning,
    SetSpinning,
    IsWalletSwitchLocked,
    SetWalletSwitchLocked,
    IsFreeSpinActive,
    GetFreeSpins,
    IsAutoSpin,
    SetAutoSpin,
    ToggleAutoSpin,
    GetAutoSpinRemaining,
    SetAutoSpinRemaining,
    DecreaseAutoSpinRemaining,
    IsTurbo,
    SetTurbo,
    ToggleTurbo,
    IsPresentationLocked,
    SetPresentationLocked,
    PresentGameStatus: emitGameStatus,
};

const pendingBalanceUpdates: ResponseBalanceUpdateType[] = [];
let pendingJackpotValues: {
    mode: JackpotMode;
    values: JackpotValues;
    responseCode?: 110 | 451;
} | null = null;
let hasReceivedSpinResult = false;
let isWaitingForJackpotPopup = false;
let journeysByBet: JourneyState[] = [];

function selectJourney(
    journey: JourneyResponse | undefined,
    totalBet: number,
    fallback: JourneyState = { total_progress: 0, stage: 0, progress: 0 },
): JourneyState {
    if (!journey) return fallback;
    if (!Array.isArray(journey)) return journey;

    return (
        journey.find(({ bet_key }) => Number(bet_key) === totalBet) ?? fallback
    );
}

type RawInitialLoadResponse = ResponseInitialLoadType & {
    data?: unknown;
    scope_id?: string;
    wt?: string;
};

function getFallbackBetLevels(
    divisor: number = FALLBACK_BET_LEVEL_DIVISOR,
): number[] {
    return FALLBACK_TOTAL_BET_LEVELS.map((totalBet) => totalBet / divisor);
}

function isBetLevel(value: number, betLevels: number[]): boolean {
    return betLevels.includes(value);
}

function normalizeBetLevelValue(
    value: number = 0,
    betLevels: number[] = getFallbackBetLevels(),
    divisor: number = FALLBACK_BET_LEVEL_DIVISOR,
): number {
    if (isBetLevel(value, betLevels)) {
        return value;
    }

    const calculatedBetLevel = value / divisor;
    if (isBetLevel(calculatedBetLevel, betLevels)) {
        return calculatedBetLevel;
    }

    return betLevels[0] || 0;
}

function normalizeBetting(
    betting?: ResponseInitialLoadType["betting"],
): ResponseInitialLoadType["betting"] {
    const divisor =
        betting?.bet_level_divisor && betting.bet_level_divisor > 0
            ? betting.bet_level_divisor
            : FALLBACK_BET_LEVEL_DIVISOR;
    const totalBetLevels = betting?.bet_levels?.length
        ? betting.bet_levels
        : [...FALLBACK_TOTAL_BET_LEVELS];
    const betLevels = totalBetLevels.map((totalBet) => totalBet / divisor);
    const defaultBetLevel = normalizeBetLevelValue(
        betting?.default_bet_level,
        betLevels,
        divisor,
    );

    return {
        bet_levels: betLevels,
        bet_level_divisor: divisor,
        default_bet_level:
            betting?.default_bet_level ?? defaultBetLevel * divisor,
    };
}

function normalizeInitialLoadData(
    data: ResponseInitialLoadType,
): ResponseInitialLoadType {
    let normalizedData: unknown = data;

    if (typeof normalizedData === "string") {
        try {
            normalizedData = JSON.parse(normalizedData);
        } catch {
            normalizedData = {};
        }
    }

    if (
        normalizedData &&
        typeof normalizedData === "object" &&
        "data" in normalizedData
    ) {
        const nestedData = (normalizedData as { data?: unknown }).data;
        if (nestedData && typeof nestedData === "object") {
            normalizedData = {
                ...normalizedData,
                ...nestedData,
            };
        }
    }

    const rawData = normalizedData as RawInitialLoadResponse;
    const rawPaytable = rawData.paytable ?? {};
    const betting = normalizeBetting(rawData.betting);
    const fallbackBetLevel = normalizeBetLevelValue(
        rawData.bet_level || betting.bet_levels[0],
        betting.bet_levels,
        betting.bet_level_divisor,
    );
    const initialTotalBet =
        rawData.total_bet ??
        rawData.betting?.default_bet_level ??
        calculateTotalBet(fallbackBetLevel);
    const initialBetLevel = normalizeBetLevelValue(
        initialTotalBet,
        betting.bet_levels,
        betting.bet_level_divisor,
    );
    const isMountDoomFreeSpin =
        rawData.free_spin_mode === 3 && (rawData.free_spins ?? 0) > 0;

    return {
        ...rawData,
        balance: rawData.balance ?? rawData.b ?? 0,
        betting,
        last_grid: rawData.last_grid || [],
        last_win: rawData.last_win || 0,
        status: rawData.status || 0,
        bet_level: initialBetLevel,
        total_bet: initialTotalBet,
        wallet_provider: rawData.wallet_provider || "",
        wallet_resource: rawData.wallet_resource || "",
        wallet_type:
            rawData.wallet_type || rawData.wt || rawData.scope_id || "",
        wallets: filterConfiguredWallets(rawData.wallets || {}),
        sticky_rings: isMountDoomFreeSpin
            ? [
                  ...new Set([
                      ...(rawData.sticky_rings ?? []),
                      ...(rawData.new_sticky_rings ?? []),
                  ]),
              ]
            : (rawData.sticky_rings ?? rawData.new_sticky_rings ?? []),
        paytable: Object.fromEntries(
            Object.entries(rawPaytable).map(([symbolId, value]) => [
                symbolId,
                typeof value === "number" ? { "3": value } : value,
            ]),
        ),
    };
}

function handleInitialLoadResponse(rawData: ResponseInitialLoadType) {
    const data = normalizeInitialLoadData(rawData);
    const jackpotMode = getCurrentJackpotMode();

    pendingJackpotValues = null;
    isWaitingForJackpotPopup = false;
    gameState.b = data.b || 0;
    gameState.c = data.c;
    gameState.currency = data.currency || "";
    gameState.game_name = data.game_name || "";
    gameState.last_grid = data.last_grid || [];
    gameState.last_win = data.last_win || 0;
    gameState.status = data.status || 0;
    gameState.betting = {
        bet_level_divisor:
            data.betting?.bet_level_divisor ?? FALLBACK_BET_LEVEL_DIVISOR,
        bet_levels: data.betting?.bet_levels || [],
    };
    gameState.total_bet =
        data.total_bet ??
        data.betting?.default_bet_level ??
        calculateTotalBet(data.betting?.bet_levels?.[0] || 0);
    gameState.bet_level = calculateBetLevel(gameState.total_bet);
    gameState.wallet_provider = data.wallet_provider || "";
    gameState.wallet_resource = data.wallet_resource || "";
    gameState.wallet_type = data.wallet_type || "";
    gameEngine.updateWalletData({ wallets: data.wallets });
    gameEngine.SetBalance(gameEngine.GetBalanceFromInitialLoad(data));
    gameState.jackpot_mode = jackpotMode;
    gameState.jackpots = gameState.jackpots_by_mode[jackpotMode];
    gameState.paytable = (data.paytable || {}) as typeof gameState.paytable;
    gameState.lore_pay = data.lore_pay ?? {};
    gameEngine.SetAutoSpin(false);
    gameState.auto_spin_remaining = 0;
    gameEngine.SetSpinning(false);
    gameState.spin_result = null;
    journeysByBet = Array.isArray(data.journey) ? data.journey : [];
    gameState.journey = selectJourney(data.journey, gameState.total_bet);
    gameState.free_spins = data.free_spins ?? 0;
    gameState.free_spin_mode = data.free_spin_mode ?? 0;
    gameState.sticky_rings = data.sticky_rings ?? [];
    gameState.respin_locks = [];
    gameState.mini_game = {
        active: data.mini_active ?? false,
        accum_mult: 0,
        scatter_count: data.scatter_count ?? 0,
        ended: false,
        total_win: 0,
    };
    gameState.presentation_locked = gameState.mini_game.active;

    eventBus.emit(EVENT_NAMES.INITIAL_LOAD_RESPONSE, {
        ...data,
        balance: gameState.balance,
        journey: gameState.journey,
    });
    eventBus.emit(EVENT_NAMES.GET_JACKPOT_VALUES_RESPONSE, {
        mode: jackpotMode,
        jpt: gameState.jackpots,
    });
    emitGameStatus();
    if (gameState.mini_game.active) {
        eventBus.emit(EVENT_NAMES.MINIGAME_STARTED, gameState.mini_game);
    }
}

function handleSpinResponse(data: ResponseSpinType) {
    const freeSpinMode = data.free_spin_mode ?? gameState.free_spin_mode;
    const freeSpins = data.free_spins ?? gameState.free_spins;
    const isMountDoomFreeSpin =
        (freeSpinMode === 3 && freeSpins > 0) ||
        (data.fs_ended === true &&
            (freeSpinMode === 3 || gameState.free_spin_mode === 3));
    const stickyRings = isMountDoomFreeSpin
        ? [
              ...new Set([
                  ...gameState.sticky_rings,
                  ...(data.sticky_rings ?? []),
                  ...(data.new_sticky_rings ?? []),
              ]),
          ]
        : (data.new_sticky_rings ?? []);
    hasReceivedSpinResult = true;
    if (data.is_jackpot) {
        isWaitingForJackpotPopup = true;
    }
    gameState.c = data.c;
    gameState.last_grid = data.grid || [];
    gameState.last_win = data.total_win || 0;
    gameState.spin_result = {
        round_id: data.round_id,
        grid: data.grid || [],
        win_lines: data.win_lines || [],
        is_jackpot: data.is_jackpot || false,
        jackpot_win: data.jackpot_win || 0,
        total_win: data.total_win || 0,
        lore_ids: data.lore_ids ?? [],
        is_respin: data.is_respin ?? false,
        respin_locks: data.respin_locks ?? [],
        trigger_mini: data.trigger_mini ?? false,
    };
    if (Array.isArray(data.journey)) {
        journeysByBet = data.journey;
    }
    gameState.journey = selectJourney(
        data.journey,
        gameState.total_bet,
        gameState.journey,
    );
    gameState.free_spins = data.fs_ended
        ? 0
        : (data.free_spins ?? gameState.free_spins);
    gameState.free_spin_mode = data.free_spin_mode ?? gameState.free_spin_mode;
    gameState.sticky_rings = stickyRings;
    gameState.respin_locks = data.respin_locks ?? [];
    if (data.trigger_mini) {
        gameState.mini_game = {
            round_id: data.round_id,
            active: true,
            accum_mult: 0,
            scatter_count: data.scatter_count ?? 0,
            ended: false,
            total_win: 0,
        };
    }

    eventBus.emit(EVENT_NAMES.SPIN_RESULT_RESPONSE, {
        ...data,
        sticky_rings: stickyRings,
    });
    if (data.c !== 101 && !data.lore_ids?.length) {
        emitGameStatus(data.is_respin ?? false);
    }
}

function handleMiniGameResponse(data: ResponseMiniGameType) {
    gameState.mini_game = {
        ...gameState.mini_game,
        round_id: data.round_id,
        active: !data.ended,
        accum_mult: data.accum_mult,
        ended: data.ended,
        total_win: data.total_win ?? gameState.mini_game.total_win,
    };
    eventBus.emit(
        data.ended ? EVENT_NAMES.MINIGAME_ENDED : EVENT_NAMES.MINIGAME_UPDATED,
        { ...data, state: gameState.mini_game },
    );
}

function emitGameStatus(isRespin = false) {
    eventBus.emit(EVENT_NAMES.GAME_STATUS_CHANGED, {
        journey: gameState.journey,
        free_spins: gameState.free_spins,
        free_spin_mode: gameState.free_spin_mode,
        sticky_rings: gameState.sticky_rings,
        is_respin: isRespin,
    });
}

function handleJackpotValuesResponse(data: ResponseJackpotValuesType) {
    const responseMode = getJackpotResponseMode(data);
    const currentMode = getCurrentJackpotMode();

    if (responseMode !== currentMode) {
        return;
    }

    const jackpots = normalizeJackpotValues(data);

    if (isWaitingForJackpotPopup) {
        pendingJackpotValues = {
            mode: responseMode,
            values: jackpots,
            responseCode: data.c,
        };
        return;
    }

    applyJackpotValues(responseMode, jackpots, data.c);
}

function applyJackpotValues(
    mode: JackpotMode,
    jackpots: JackpotValues,
    responseCode?: 110 | 451,
) {
    gameState.jackpots_by_mode[mode] = jackpots;
    if (mode !== getCurrentJackpotMode()) return;

    gameState.jackpot_mode = mode;
    gameState.jackpots = jackpots;
    eventBus.emit(EVENT_NAMES.GET_JACKPOT_VALUES_RESPONSE, {
        c: responseCode,
        mode,
        jpt: jackpots,
    });
}

function flushPendingJackpotValues() {
    isWaitingForJackpotPopup = false;
    if (!pendingJackpotValues) return;

    const { mode, values, responseCode } = pendingJackpotValues;
    pendingJackpotValues = null;
    applyJackpotValues(mode, values, responseCode);
}

eventBus.on(EVENT_NAMES.JACKPOT_ANIMATION_COMPLETED, flushPendingJackpotValues);

function handleBalanceUpdateResponse(data: ResponseBalanceUpdateType) {
    if (gameEngine.IsSpinning() && hasReceivedSpinResult) {
        pendingBalanceUpdates.push(data);
        return;
    }

    applyBalanceUpdateResponse(data);
}

function applyBalanceUpdateResponse(data: ResponseBalanceUpdateType) {
    const balance = data.balance ?? data.b ?? 0;
    const responseWalletType = data.wallet_type ?? data.wt ?? data.scope_id;
    const activeWalletKey = gameEngine.GetActiveWalletKey();
    const walletKey =
        data.wallet_key ??
        (responseWalletType
            ? GetWalletKeyForType(responseWalletType, data.wallet_resource)
            : activeWalletKey);

    if (!responseWalletType || walletKey === "main") {
        gameEngine.SetBalance(balance);
    }

    if (walletKey) {
        gameState.wallets[walletKey] = balance;
    }

    if (walletKey === activeWalletKey) {
        gameEngine.SetBalance(balance);
    }

    eventBus.emit(EVENT_NAMES.BALANCE_UPDATE_RESPONSE, {
        ...data,
        balance,
        wallet_key: walletKey ?? undefined,
        wallet_type: responseWalletType ?? data.wallet_type,
    });
}

function flushPendingBalanceUpdates() {
    if (pendingBalanceUpdates.length === 0) return;

    const updates = pendingBalanceUpdates.splice(0);
    updates.forEach(applyBalanceUpdateResponse);
}

function normalizeJackpotValues(
    data: ResponseJackpotValuesType,
): JackpotValues {
    const jpt = (data as { jpt?: JackpotValues }).jpt;
    if (jpt) {
        return jpt;
    }

    const nestedJackpots = (data as { jackpots?: JackpotValues }).jackpots;
    if (nestedJackpots) {
        return nestedJackpots;
    }

    const jackpots: JackpotValues = {};
    Object.entries(data).forEach(([key, value]) => {
        if (
            key !== "c" &&
            key !== "jpt" &&
            key !== "mode" &&
            typeof value === "number"
        ) {
            jackpots[key] = value;
        }
    });

    return jackpots;
}

function getCurrentJackpotMode(): JackpotMode {
    return isDemoMode() ? "demo" : "real";
}

function getJackpotResponseMode(data: ResponseJackpotValuesType): JackpotMode {
    return data.mode === "demo" ? "demo" : "real";
}

function handleErrorResponse(data: { errc?: string | number; error?: string }) {
    const errorKey = normalizeGameErrorCode(data.errc ?? data.error);
    const errorMessage = getErrorMessage(errorKey, data.error);

    console.error("[ENGINE] Error received", {
        errorKey,
        errorMessage,
        data,
    });

    eventBus.emit(EVENT_NAMES.ERROR_OCCURRED, {
        errorKey,
        errorMessage,
        rawError: data,
        canHide: true,
    });
}

function GetBetLevel(): number {
    if (!gameState.bet_level) {
        return (
            calculateBetLevel(gameState.total_bet) ||
            gameState.betting.bet_levels[0] ||
            0
        );
    }

    return gameState.bet_level;
}

function GetTotalBet(): number {
    return gameState.total_bet || calculateTotalBet(gameEngine.GetBetLevel());
}

function GetJourney(): JourneyState {
    return gameState.journey;
}

function SetBetLevel(betLevel: number) {
    gameState.bet_level = betLevel;
    gameState.total_bet = calculateTotalBet(betLevel);
    gameState.journey = selectJourney(journeysByBet, gameState.total_bet);
    emitGameStatus();
}

function SetTotalBet(totalBet: number) {
    gameState.total_bet = totalBet;
    gameState.bet_level = calculateBetLevel(totalBet);
    gameState.journey = selectJourney(journeysByBet, gameState.total_bet);
    emitGameStatus();
}

function calculateTotalBet(betLevel: number): number {
    return betLevel * gameState.betting.bet_level_divisor;
}

function calculateBetLevel(totalBet: number): number {
    return totalBet / gameState.betting.bet_level_divisor;
}

function SetBalance(balance: number) {
    gameState.balance = balance;
}

function updateWalletData(data: { wallets?: Record<string, number> }) {
    gameState.wallets = data.wallets || {};
}

function GetActiveWalletKey(): string | null {
    if (!gameState.wallets || Object.keys(gameState.wallets).length === 0) {
        return null;
    }

    const walletType = gameState.wallet_type;
    if (!walletType) {
        return null;
    }

    const walletResource = gameState.wallet_resource;
    if (walletResource) {
        const compositeKey = `${walletResource}:${walletType}`;
        if (compositeKey in gameState.wallets) {
            return compositeKey;
        }
    }

    const matchingCompositeKey = Object.keys(gameState.wallets).find((key) =>
        key.endsWith(`:${walletType}`),
    );
    if (matchingCompositeKey) {
        return matchingCompositeKey;
    }

    if (walletType in gameState.wallets) {
        return walletType;
    }

    return null;
}

function GetWalletKeyForType(
    walletType: string,
    walletResource?: string,
): string | null {
    if (!gameState.wallets || Object.keys(gameState.wallets).length === 0) {
        return walletType;
    }

    const resource = walletResource || gameState.wallet_resource;
    if (resource) {
        const compositeKey = `${resource}:${walletType}`;
        if (compositeKey in gameState.wallets) {
            return compositeKey;
        }
    }

    const matchingCompositeKey = Object.keys(gameState.wallets).find((key) =>
        key.endsWith(`:${walletType}`),
    );
    if (matchingCompositeKey) {
        return matchingCompositeKey;
    }

    if (walletType in gameState.wallets) {
        return walletType;
    }

    return resource ? `${resource}:${walletType}` : walletType;
}

function GetActiveWalletBalance(): number {
    const activeWalletKey = GetActiveWalletKey();

    if (activeWalletKey && gameState.wallets[activeWalletKey] !== undefined) {
        return gameState.wallets[activeWalletKey];
    }

    return gameState.balance;
}

function GetBalanceFromInitialLoad(data: ResponseInitialLoadType): number {
    const activeWalletKey = GetActiveWalletKey();

    if (
        activeWalletKey &&
        data.wallets &&
        data.wallets[activeWalletKey] !== undefined
    ) {
        return data.wallets[activeWalletKey];
    }

    return data.balance ?? data.b ?? 0;
}

function GetBetLevels(): number[] {
    return gameState.betting.bet_levels;
}

function GetLastGrid(): SlotGrid {
    return gameState.last_grid;
}

function GetLastWin(): number {
    return gameState.last_win;
}

function GetJackpotMode(): JackpotMode {
    return gameState.jackpot_mode;
}

function GetJackpotValues(): JackpotValues {
    return gameState.jackpots_by_mode[getCurrentJackpotMode()];
}

function GetJackpotValueForBet(bet?: number): number {
    const betKey = String(bet || gameEngine.GetBetLevel());
    return gameEngine.GetJackpotValues()[betKey] || 0;
}

function IsSpinning(): boolean {
    return gameState.is_spinning;
}

function SetSpinning(isSpinning: boolean): void {
    if (gameState.is_spinning === isSpinning) return;

    gameState.is_spinning = isSpinning;
    if (isSpinning) {
        hasReceivedSpinResult = false;
    }

    eventBus.emit(EVENT_NAMES.SPIN_STATE_CHANGED, isSpinning);

    if (!isSpinning) {
        flushPendingBalanceUpdates();
        hasReceivedSpinResult = false;
    }
}

function IsWalletSwitchLocked(): boolean {
    return gameState.wallet_switch_locked;
}

function SetWalletSwitchLocked(locked: boolean): void {
    if (gameState.wallet_switch_locked === locked) return;

    gameState.wallet_switch_locked = locked;
    eventBus.emit(EVENT_NAMES.WALLET_SWITCH_LOCK_CHANGED, locked);
}

function IsAutoSpin(): boolean {
    return gameState.is_auto_spin;
}

function IsFreeSpinActive(): boolean {
    return gameState.free_spins > 0;
}

function GetFreeSpins(): number {
    return gameState.free_spins;
}

function SetAutoSpin(isAutoSpin: boolean): void {
    if (gameState.is_auto_spin === isAutoSpin) return;

    gameState.is_auto_spin = isAutoSpin;
    if (!isAutoSpin) {
        gameState.auto_spin_remaining = 0;
        eventBus.emit(EVENT_NAMES.AUTO_SPIN_REMAINING_CHANGED, 0);
    } else if (gameState.auto_spin_remaining <= 0) {
        gameState.auto_spin_remaining = Infinity;
        eventBus.emit(EVENT_NAMES.AUTO_SPIN_REMAINING_CHANGED, Infinity);
    }
    eventBus.emit(EVENT_NAMES.AUTO_SPIN_CHANGED, isAutoSpin);
}

function ToggleAutoSpin(): boolean {
    const nextIsAutoSpin = !gameState.is_auto_spin;

    SetAutoSpin(nextIsAutoSpin);
    return nextIsAutoSpin;
}

function GetAutoSpinRemaining(): number {
    return gameState.auto_spin_remaining;
}

function SetAutoSpinRemaining(remaining: number): void {
    gameState.auto_spin_remaining =
        remaining === Infinity ? Infinity : Math.max(0, Math.floor(remaining));
    eventBus.emit(
        EVENT_NAMES.AUTO_SPIN_REMAINING_CHANGED,
        gameState.auto_spin_remaining,
    );
}

function DecreaseAutoSpinRemaining(): number {
    if (!gameState.is_auto_spin) return gameState.auto_spin_remaining;
    if (gameState.auto_spin_remaining === Infinity) return Infinity;
    if (gameState.auto_spin_remaining <= 0) return 0;

    gameState.auto_spin_remaining -= 1;
    eventBus.emit(
        EVENT_NAMES.AUTO_SPIN_REMAINING_CHANGED,
        gameState.auto_spin_remaining,
    );
    return gameState.auto_spin_remaining;
}

function IsTurbo(): boolean {
    return gameState.is_turbo;
}

function SetTurbo(isTurbo: boolean): void {
    if (gameState.is_turbo === isTurbo) return;

    gameState.is_turbo = isTurbo;
    eventBus.emit(EVENT_NAMES.TURBO_CHANGED, isTurbo);
}

function ToggleTurbo(): boolean {
    const nextIsTurbo = !gameState.is_turbo;

    SetTurbo(nextIsTurbo);
    return nextIsTurbo;
}

function IsPresentationLocked(): boolean {
    return gameState.presentation_locked;
}

function SetPresentationLocked(locked: boolean, stopAutoSpin = true): void {
    if (gameState.presentation_locked === locked) return;
    gameState.presentation_locked = locked;
    if (locked && stopAutoSpin) gameEngine.SetAutoSpin(false);
    eventBus.emit(EVENT_NAMES.PRESENTATION_LOCK_CHANGED, locked);
}

export type GoalEngine = {
    ChangeBetLevel(direction: -1 | 1): void;
    SetBetLevel(index: number): void;
    CanChangeBet(): boolean;
    CanReset(): boolean;
    ResetBet(): void;
    CanDecreaseBet(): boolean;
    CanIncreaseBet(): boolean;
    BetLevelNumber(): number;
    BetLevelKey(): string;
    CanPlay(): boolean;
    CanRandom(): boolean;
    CanCashout(): boolean;
    IsPresentationLocked(): boolean;
    SetPresentationLocked(locked: boolean): void;
    ToggleBetList(): void;
    SecondsLeft(): number | null;
    SetSecondsLeft(seconds: number | null): void;
    Play(balance: number, units: readonly number[]): GoalPlayResult;
    Pick(slot: number): GoalPickResult;
    Cashout(): GoalPickResult;
    TakeCashout(): GoalPickResult;
    ApplyRound(round: GoalRound): void;
    RandomSlot(unit: number): number;
};

export const goalEngine: GoalEngine = {
    ChangeBetLevel,
    SetBetLevel: GoalSetBetLevel,
    CanChangeBet,
    CanReset,
    ResetBet,
    CanDecreaseBet,
    CanIncreaseBet,
    BetLevelNumber,
    BetLevelKey,
    CanPlay,
    CanRandom,
    CanCashout,
    IsPresentationLocked: GoalIsPresentationLocked,
    SetPresentationLocked: GoalSetPresentationLocked,
    ToggleBetList,
    SecondsLeft,
    SetSecondsLeft,
    Play,
    Pick,
    Cashout,
    TakeCashout,
    ApplyRound,
    RandomSlot,
};

const FIRST_BET_LEVEL = GOAL_BET_LEVELS[0];

function ChangeBetLevel(direction: -1 | 1) {
    if (direction < 0 && !CanDecreaseBet()) return;
    if (direction > 0 && !CanIncreaseBet()) return;

    GoalSetBetLevel(betIndex() + direction);
}

function GoalSetBetLevel(index: number) {
    if (!CanChangeBet()) return;
    const bets = ladderBets();
    if (!Number.isInteger(index) || index < 0 || index >= bets.length) {
        return;
    }

    const held = goalState.round.phase === "standby" ? goalState.round.column : undefined;
    goalState.error = null;
    goalState.notice = null;
    goalState.betListOpen = false;
    goalState.round = {
        phase: "standby",
        betLevel: bets[index],
        betChosen: true,
        column: held,
    };
    goalEvents.emit(GOAL_EVENT_NAMES.BET_LEVEL_CHANGED, goalState.round);
}

function CanChangeBet() {
    return !goalState.presentationLocked && goalState.round.phase === "standby";
}

function CanReset() {
    return !goalState.presentationLocked && goalState.round.phase === "ended";
}

function ResetBet() {
    const round = goalState.round;
    if (round.phase !== "ended") return;

    goalState.error = null;
    goalState.presentationLocked = false;
    goalState.betListOpen = false;
    goalState.round = {
        phase: "standby",
        betLevel: round.betLevel,
        betChosen: false,
        column: round.column,
    };
    goalEvents.emit(GOAL_EVENT_NAMES.STANDBY, goalState.round);
}

function CanDecreaseBet() {
    return CanChangeBet() && betIndex() > 0;
}

function CanIncreaseBet() {
    return CanChangeBet() && betIndex() < ladderBets().length - 1;
}

function BetLevelNumber() {
    return betIndex() + 1;
}

function BetLevelKey() {
    return goalState.ladder[betIndex()]?.level ?? String(goalState.round.betLevel);
}

function ladderBets() {
    const bets = goalState.ladder.map((row) => row.bet);
    return bets.length > 0 ? bets : [...GOAL_BET_LEVELS];
}

function betIndex() {
    const index = ladderBets().indexOf(goalState.round.betLevel);
    return index === -1 ? 0 : index;
}

function CanPlay() {
    if (goalState.presentationLocked) return false;
    const round = goalState.round;
    if (round.phase === "ended") return true;
    return round.phase === "standby" && round.betChosen;
}

function CanRandom() {
    return !goalState.presentationLocked && goalState.round.phase === "playing";
}

function CanCashout() {
    return (
        !goalState.presentationLocked &&
        goalState.round.phase === "playing" &&
        goalState.round.clearedColumns > 0
    );
}

function GoalIsPresentationLocked() {
    return goalState.presentationLocked;
}

function GoalSetPresentationLocked(locked: boolean) {
    if (goalState.presentationLocked === locked) return;

    goalState.presentationLocked = locked;
    goalEvents.emit(GOAL_EVENT_NAMES.PRESENTATION_LOCK_CHANGED, locked);
}

function ToggleBetList() {
    if (!CanChangeBet()) return;

    goalState.betListOpen = !goalState.betListOpen;
    goalEvents.emit(GOAL_EVENT_NAMES.BET_LIST_CHANGED, goalState.betListOpen);
}

function SecondsLeft() {
    return goalState.secondsLeft;
}

function SetSecondsLeft(seconds: number | null) {
    if (goalState.secondsLeft === seconds) return;

    goalState.secondsLeft = seconds;
    goalEvents.emit(GOAL_EVENT_NAMES.SECONDS_CHANGED, seconds);
}

function Play(balance: number, units: readonly number[]): GoalPlayResult {
    const round = goalState.round;
    const ready =
        round.phase === "ended" ||
        (round.phase === "standby" && round.betChosen);
    if (goalState.presentationLocked || !ready) {
        reject("state");
        return { ok: false, round };
    }

    if (balance < round.betLevel) {
        reject("balance");
        return { ok: false, round };
    }

    const playing = {
        phase: "playing" as const,
        betLevel: round.betLevel,
        column: 0,
        clearedColumns: 0,
        cashoutAmount: 0,
        traps: trapsFrom(units),
        cleared: [],
    };
    const started = {
        ok: true as const,
        round: playing,
        stake: round.betLevel,
    };
    goalState.error = null;
    goalState.betListOpen = false;
    goalState.round = playing;
    syncCells();
    goalEvents.emit(GOAL_EVENT_NAMES.PLAY_STARTED, started);
    return started;
}

function Pick(slot: number): GoalPickResult {
    const round = goalState.round;
    if (goalState.presentationLocked) {
        return { round, cashedOut: 0, lost: false };
    }
    if (
        round.phase !== "playing" ||
        slot < 0 ||
        slot >= GOAL_SLOT_COUNT ||
        !Number.isInteger(slot)
    ) {
        reject("slot");
        return { round, cashedOut: 0, lost: false };
    }

    if (slot === round.traps[round.column]) {
        const result: GoalPickResult = {
            cashedOut: 0,
            lost: true,
            round: standby(round.betLevel),
        };
        syncCells({ kind: "boom", column: round.column });
        endRound();
        result.round = goalState.round;
        goalEvents.emit(GOAL_EVENT_NAMES.PICK_RESOLVED, result);
        return result;
    }

    const amount = cashoutForClearedColumn(round.betLevel, round.column);
    const clearedColumns = round.clearedColumns + 1;

    if (clearedColumns >= GOAL_COLUMN_COUNT) {
        const finished: GoalPlaying = {
            ...round,
            column: round.column,
            clearedColumns,
            cashoutAmount: amount,
            cleared: [...round.cleared, { column: round.column, slot }],
        };
        goalState.round = finished;
        const result: GoalPickResult = {
            cashedOut: amount,
            lost: false,
            round: standby(round.betLevel),
        };
        syncCells({ kind: "bombs" });
        endRound();
        result.round = goalState.round;
        goalEvents.emit(GOAL_EVENT_NAMES.PICK_RESOLVED, result);
        return result;
    }

    goalState.error = null;
    goalState.round = {
        phase: "playing",
        betLevel: round.betLevel,
        column: round.column + 1,
        clearedColumns,
        cashoutAmount: amount,
        traps: round.traps,
        cleared: [...round.cleared, { column: round.column, slot }],
    };
    syncCells();
    const result: GoalPickResult = {
        round: goalState.round,
        cashedOut: 0,
        lost: false,
    };
    goalEvents.emit(GOAL_EVENT_NAMES.PICK_RESOLVED, result);
    return result;
}

function Cashout(): GoalPickResult {
    if (goalState.presentationLocked) {
        return { round: goalState.round, cashedOut: 0, lost: false };
    }
    if (!CanCashout() || goalState.round.phase !== "playing") {
        reject("state");
        return { round: goalState.round, cashedOut: 0, lost: false };
    }

    return payOut(GOAL_EVENT_NAMES.CASHOUT);
}

function TakeCashout(): GoalPickResult {
    const round = goalState.round;
    if (round.phase !== "playing") {
        return { round, cashedOut: 0, lost: false };
    }
    if (round.clearedColumns === 0) return loseRound();

    return payOut(GOAL_EVENT_NAMES.CASHOUT);
}

function loseRound(): GoalPickResult {
    const round = goalState.round;
    if (round.phase !== "playing") {
        return { round, cashedOut: 0, lost: false };
    }

    const result: GoalPickResult = {
        cashedOut: 0,
        lost: true,
        round: standby(round.betLevel),
    };
    syncCells({ kind: "loss" });
    endRound();
    result.round = goalState.round;
    goalEvents.emit(GOAL_EVENT_NAMES.PICK_RESOLVED, result);
    return result;
}

function ApplyRound(round: GoalRound) {
    goalState.error = null;
    goalState.presentationLocked = false;
    goalState.betListOpen = false;
    goalState.secondsLeft = null;
    goalState.round = round;
    syncCells();
    goalEvents.emit(GOAL_EVENT_NAMES.STANDBY, goalState.round);
}

function reject(reason: "balance" | "state" | "slot") {
    goalState.error = goalErrorCode(reason);
    goalEvents.emit(GOAL_EVENT_NAMES.ERROR, goalState.error);
}

function RandomSlot(unit: number) {
    const scaled = Math.floor(unit * GOAL_SLOT_COUNT);
    return Math.min(GOAL_SLOT_COUNT - 1, Math.max(0, scaled));
}

function payOut(event: string): GoalPickResult {
    const round = goalState.round;
    if (round.phase !== "playing") {
        return { round, cashedOut: 0, lost: false };
    }

    const result: GoalPickResult = {
        cashedOut: round.cashoutAmount,
        lost: false,
        round: standby(round.betLevel),
    };
    syncCells({ kind: "bombs" });
    endRound();
    result.round = goalState.round;
    goalEvents.emit(event, result);
    return result;
}

function endRound() {
    const round = goalState.round;
    if (round.phase !== "playing") return;

    goalState.presentationLocked = false;
    goalState.betListOpen = false;
    goalState.round = {
        phase: "ended",
        betLevel: round.betLevel,
        betChosen: true,
        column: round.column,
        clearedColumns: round.clearedColumns,
    };
}

function trapsFrom(units: readonly number[]): number[] {
    return Array.from({ length: GOAL_COLUMN_COUNT }, (_, column) =>
        RandomSlot(units[column] ?? 0),
    );
}

function standby(betLevel: number): GoalStandby {
    return {
        phase: "standby",
        betLevel: normalizeBetLevel(betLevel),
        betChosen: false,
    };
}

function normalizeBetLevel(betLevel: number) {
    if (GOAL_BET_LEVELS.includes(betLevel as (typeof GOAL_BET_LEVELS)[number])) {
        return betLevel;
    }

    return FIRST_BET_LEVEL;
}

function cashoutForClearedColumn(betLevel: number, clearedColumn: number) {
    const multiplier = GOAL_STEP_MULTIPLIERS[clearedColumn];
    const hundredths = Math.round(multiplier * 100);
    return Math.round((betLevel * hundredths) / 100);
}

function syncCells(reveal?: CellReveal) {
    const round = goalState.round;
    const faces = blankFaces();
    if (round.phase !== "playing") {
        goalState.cells = faces;
        return;
    }

    const boomColumn = reveal?.kind === "boom" ? reveal.column : null;
    const showBombs = reveal !== undefined;
    const pinkAll = reveal?.kind === "loss";

    for (let column = 0; column < GOAL_COLUMN_COUNT; column += 1) {
        const exploded = pinkAll || (boomColumn !== null && column >= boomColumn);
        for (let slot = 0; slot < GOAL_SLOT_COUNT; slot += 1) {
            const active =
                !showBombs && !exploded && column === round.column;
            faces[column][slot] = {
                tile: exploded ? "explode" : active ? "active" : "normal",
                mark: "none",
            };
        }
    }

    round.cleared.forEach((pick, index) => {
        const latest =
            boomColumn === null && index === round.cleared.length - 1;
        faces[pick.column][pick.slot] = {
            tile: "normal",
            mark: latest ? "ball" : "bullet",
        };
    });

    if (showBombs) {
        for (let column = 0; column < GOAL_COLUMN_COUNT; column += 1) {
            const slot = round.traps[column];
            if (boomColumn === column) {
                faces[column][slot].mark = "explode";
                continue;
            }
            if (faces[column][slot].mark !== "none") continue;

            faces[column][slot].mark = "bomb";
        }
    }

    goalState.cells = faces;
}

type CellReveal =
    | { kind: "boom"; column: number }
    | { kind: "bombs" }
    | { kind: "loss" };

function blankFaces(): GoalCellFace[][] {
    return Array.from({ length: GOAL_COLUMN_COUNT }, () =>
        Array.from({ length: GOAL_SLOT_COUNT }, () => cell("normal", "none")),
    );
}

function cell(tile: GoalCellTile, mark: GoalCellMark): GoalCellFace {
    return { tile, mark };
}

syncCells();
