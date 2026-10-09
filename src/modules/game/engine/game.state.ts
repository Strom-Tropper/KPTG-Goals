import {
    GOAL_BET_LEVELS,
    GOAL_STEP_MULTIPLIERS,
    GOAL_TURN_MS,
    type GoalErrorCode,
} from "./game.constants";
import {
    GoalCellFace,
    GoalRound,
    JackpotMode,
    JackpotValues,
    FreeSpinMode,
    JourneyState,
    LorePay,
    MiniGameState,
    Paytable,
    SlotGrid,
    WinLine,
} from "./game.types";

type BettingState = {
    bet_level_divisor: number;
    bet_levels: number[];
};

type SpinResultState = {
    round_id: string;
    grid: SlotGrid;
    win_lines: WinLine[];
    is_jackpot: boolean;
    jackpot_win: number;
    total_win: number;
    lore_ids: string[];
    is_respin: boolean;
    respin_locks: number[];
    trigger_mini: boolean;
};

type GameState = {
    b: number;
    balance: number;
    c: number;
    currency: string;
    game_name: string;
    last_grid: SlotGrid;
    last_win: number;
    status: number;
    bet_level: number;
    total_bet: number;
    wallet_provider: string;
    wallet_resource: string;
    wallet_type: string;
    wallets: Record<string, number>;
    betting: BettingState;
    jackpot_mode: JackpotMode;
    jackpots: JackpotValues;
    jackpots_by_mode: Record<JackpotMode, JackpotValues>;
    paytable: Paytable;
    lore_pay: LorePay;
    is_turbo: boolean;
    is_auto_spin: boolean;
    auto_spin_remaining: number;
    is_spinning: boolean;
    wallet_switch_locked: boolean;
    spin_result: SpinResultState | null;
    journey: JourneyState;
    free_spins: number;
    free_spin_mode: FreeSpinMode;
    sticky_rings: number[];
    respin_locks: number[];
    mini_game: MiniGameState;
    presentation_locked: boolean;
};

export const gameState: GameState = {
    b: 0,
    balance: 0,
    c: 0,
    currency: "",
    game_name: "",
    last_grid: [],
    last_win: 0,
    status: 0,
    bet_level: 0,
    total_bet: 0,
    wallet_provider: "",
    wallet_resource: "",
    wallet_type: "",
    wallets: {},
    betting: {
        bet_level_divisor: 10,
        bet_levels: [],
    },
    jackpot_mode: "real",
    jackpots: {},
    jackpots_by_mode: {
        demo: {},
        real: {},
    },
    paytable: {},
    lore_pay: {},
    is_turbo: false,
    is_auto_spin: false,
    auto_spin_remaining: 0,
    is_spinning: false,
    wallet_switch_locked: false,
    spin_result: null,
    journey: { total_progress: 0, stage: 0, progress: 0 },
    free_spins: 0,
    free_spin_mode: 0,
    sticky_rings: [],
    respin_locks: [],
    mini_game: {
        active: false,
        accum_mult: 0,
        scatter_count: 0,
        ended: false,
        total_win: 0,
    },
    presentation_locked: false,
};


export type GoalLadderRow = {
    level: string;
    bet: number;
};

type GoalState = {
    round: GoalRound;
    cells: GoalCellFace[][];
    error: GoalErrorCode | null;
    notice: string | null;
    presentationLocked: boolean;
    betListOpen: boolean;
    secondsLeft: number | null;
    deadlineMs: number | null;
    answerOrdinal: number | null;
    ladder: GoalLadderRow[];
    multipliersX100: number[];
};

const shippedLadder = GOAL_BET_LEVELS.map((bet) => ({
    level: String(bet),
    bet,
}));

export const goalState: GoalState = {
    round: {
        phase: "standby",
        betLevel: GOAL_BET_LEVELS[0],
        betChosen: false,
    },
    cells: [],
    error: null,
    notice: null,
    presentationLocked: false,
    betListOpen: false,
    secondsLeft: GOAL_TURN_MS / 1000,
    deadlineMs: null,
    answerOrdinal: null,
    ladder: shippedLadder,
    multipliersX100: GOAL_STEP_MULTIPLIERS.map((value) => Math.round(value * 100)),
};
