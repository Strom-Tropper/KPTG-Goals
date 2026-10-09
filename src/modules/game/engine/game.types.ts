export type SlotGrid = number[][];

export type JourneyState = {
    bet_key?: string;
    /** Progress along the current stage route, from 0 to 100. */
    progress: number;
    total_progress: number;
    stage: number;
};

export type JourneyResponse = JourneyState | JourneyState[];

type GameGridDefinition = { rings: number; slices: number };
type Milestone = { id: number; name: string; free_spins: number };
type SymbolDefinitions = Record<string, string>;

export type FreeSpinMode = 0 | 1 | 2 | 3;
type MiniSpotKind = "safe" | "ringwraith" | "end";

export type MiniGameState = {
    round_id?: string;
    active: boolean;
    accum_mult: number;
    scatter_count: number;
    ended: boolean;
    total_win: number;
};

export type JackpotValues = Record<string, number>;

export type JackpotMode = "demo" | "real";

export type Paytable = Record<string, Record<string, number>>;
type InitialPaytable = Paytable | Record<string, number>;

export type LorePay = {
    blade_in_the_dark?: number;
    burden_of_the_ring?: number;
    second_breakfast?: number;
    three_hunters?: number;
    wizards_duel?: number;
};

export type WinLine = {
    slice_idx?: number;
    line_id?: number;
    pattern?: number[];
    symbol_id: number;
    match_count: number;
    col_counts?: number[];
    paytable_mult: number;
    multiplier?: number;
    win_amount: number;
    progress_pct?: number;
    lore_id?: string;
};

type LoreWin = {
    lore_id: string;
    paytable_mult?: number;
    progress_pct?: number;
    slice_idx?: number;
    win_amount?: number;
};

export type ResponseInitialLoadType = {
    b: number;
    balance: number;
    c: 100;
    currency: string;
    game_name: string;
    last_grid: SlotGrid;
    last_win: number;
    is_jackpot?: boolean;
    jackpot_win?: number;
    winlines?: WinLine[] | null;
    win_lines?: WinLine[] | null;
    status: number;
    bet_level?: number;
    total_bet?: number;
    wallet_provider: string;
    wallet_resource: string;
    wallet_type: string;
    wallets: Record<string, number>;
    betting: {
        bet_level_divisor?: number;
        bet_levels: number[];
        default_bet_level?: number;
    };
    jackpots?: JackpotValues;
    paytable?: InitialPaytable;
    lore_pay?: LorePay;
    symbols?: SymbolDefinitions;
    milestones?: Milestone[];
    grid?: GameGridDefinition;
    mode?: "demo" | "real";
    displayName?: string;
    display_name?: string;
    total_win?: number;
    journey?: JourneyResponse;
    free_spins?: number;
    free_spin_mode?: FreeSpinMode;
    sticky_rings?: number[] | null;
    new_sticky_rings?: number[] | null;
    mini_active?: boolean;
    scatter_count?: number;
    bonus_game?: {
        ringwraith_count?: number;
        safe_prizes?: number[];
        scatter_mult?: number[];
    };
};

export type ResponseSpinType = {
    c: 101;
    round_id: string;
    grid: SlotGrid;
    win_lines: WinLine[] | null;
    is_jackpot: boolean;
    jackpot_win: number;
    total_win: number;
    jackpot_kind?: "" | "minor" | "major" | "grand";
    journey?: JourneyResponse;
    free_spins?: number;
    free_spin_mode?: FreeSpinMode;
    sticky_rings?: number[];
    new_sticky_rings?: number[] | null;
    lore_ids?: string[] | null;
    lore_wins?: LoreWin[] | null;
    is_respin?: boolean;
    respin_locks?: number[] | null;
    trigger_mini?: boolean;
    scatter_count?: number;
    fs_awarded?: number;
    fs_total?: number;
    fs_ended?: boolean;
    /** Accumulated win for the completed free-spin session. */
    cycle_win?: number;
    progress_gain?: number;
};

export type ResponseMiniGameType = {
    c: 104;
    round_id: string;
    spot: number;
    kind: MiniSpotKind;
    prize?: number;
    ended: boolean;
    accum_mult: number;
    total_win?: number;
    scatter?: number;
    scatter_mult?: number;
    spots?: Array<{
        opened: boolean;
        kind?: MiniSpotKind;
        prize?: number;
    }>;
};

export type ResponseJackpotValuesType =
    | {
          c?: 110 | 451;
          jpt: JackpotValues;
          mode?: JackpotMode;
      }
    | {
          c?: 110 | 451;
          jackpots: JackpotValues;
          mode?: JackpotMode;
      }
    | (JackpotValues & { c?: 110 | 451; mode?: JackpotMode });

export type GoalBetLevel = {
    level: string;
    bet: number;
};

export type GoalGameConfig = {
    bet_levels: GoalBetLevel[];
    trap_count: number;
    multipliers_x100: number[];
    turn_timer_seconds: number;
    reveal_delay_ms: number;
};

export type GoalWireTurn = {
    ordinal?: number;
    column?: number;
    by?: string;
    action?: string;
    slot?: number;
    trap?: boolean;
    presence?: string;
};

export type GoalWireOpen = {
    ticket_id?: string;
    round_id?: string;
    ordinal: number;
    next?: string;
    bet?: number;
    cleared?: number;
    board?: Array<number | null>;
    turns?: GoalWireTurn[];
    current_win?: number;
    deadline_ms?: number;
    expired?: boolean;
};

export type GoalWireFinished = {
    ticket_id?: string;
    round_id?: string;
    bet?: number;
    win?: number;
    ending?: string;
    board?: Array<number | null>;
    turns?: GoalWireTurn[];
};

export type GoalConnectState = {
    state?: string | GoalConnectState;
    open?: GoalWireOpen;
    finished?: GoalWireFinished;
    game_config?: GoalGameConfig;
};

export type GoalStatusFrame = {
    ticket_id?: string;
    round_id?: string;
    ordinal?: number;
    kind?: string;
    win?: number;
    total?: number;
    done?: boolean;
    deadline_ms?: number;
    payload?: {
        next?: string;
        cleared?: number;
        turn?: GoalWireTurn;
        board?: Array<number | null>;
        current_win?: number;
        ending?: string;
    };
};

export type GoalErrorFrame = {
    err?: number;
    errc?: string;
    error?: string;
};

export type ResponseBalanceUpdateType = {
    b?: number;
    balance?: number;
    c?: number;
    code?: number;
    platform_id?: string;
    scope_id?: string;
    time?: number;
    wallet_key?: string;
    wallet_resource?: string;
    wallet_type?: string;
    wt?: string;
};

export type BetHistoryKind = "parent" | "respin" | "mini" | "free";

export type BetHistoryTicket = {
    bet?: number;
    bet_amount?: number;
    created_at?: string;
    free_spin?: number;
    g?: number[][];
    grid?: number[][];
    is_jackpot?: boolean;
    jp?: boolean;
    jackpot_win?: number;
    jw?: number;
    kind?: BetHistoryKind;
    round?: string;
    round_id?: string;
    status_text?: string;
    time?: string;
    ticket_id?: string;
    win?: number;
    win_amount?: number;
    status?: number | string;
    current_win?: number;
    mini_scatter?: number;
    saruman_pos?: number[] | null;
    start_time?: string;
    wl?: WinLine[] | null;
    win_lines?: WinLine[] | null;
};

export type BetHistoryItem = BetHistoryTicket & {
    bet: number;
    created_at: string;
    round_id: string;
    win: number;
    status: number | string;
    free_tickets?: BetHistoryTicket[] | null;
    mini_tickets?: BetHistoryTicket[] | null;
    respin_tickets?: BetHistoryTicket[] | null;
};

export type JackpotHistoryItem = {
    created_at: string;
    jackpot_id: string;
    pool: string;
    time?: string;
    uid: string;
    win: number;
    amount?: number;
    win_amount?: number;
    bet?: number;
    bet_amount?: number;
    bet_level?: number;
    id?: string;
    round_id?: string;
    username?: string;
    display_name?: string;
};

export type ResponseBetHistoryType = {
    c: number;
    list: BetHistoryItem[];
    page: number;
    total: number;
};

export type ResponseJackpotHistoryType = {
    c: number;
    list: JackpotHistoryItem[];
    page: number;
    total: number;
};

export type GoalSlotPick = {
    column: number;
    slot: number;
};

export type GoalStandby = {
    phase: "standby";
    betLevel: number;
    betChosen: boolean;
    column?: number;
};

export type GoalPlaying = {
    phase: "playing";
    betLevel: number;
    column: number;
    clearedColumns: number;
    cashoutAmount: number;
    traps: number[];
    cleared: GoalSlotPick[];
};

export type GoalEnded = {
    phase: "ended";
    betLevel: number;
    betChosen: boolean;
    column: number;
    clearedColumns: number;
};

export type GoalRound = GoalStandby | GoalPlaying | GoalEnded;

export type GoalPlayResult =
    | { ok: false; round: GoalRound }
    | { ok: true; round: GoalPlaying; stake: number };

export type GoalRoundResult = {
    won: boolean;
    bet: number;
    amount: number;
    balance: number;
};

export type GoalPickResult = {
    round: GoalRound;
    cashedOut: number;
    lost: boolean;
};

export type GoalCellTile = "normal" | "active" | "explode";

export type GoalCellMark = "none" | "ball" | "bomb" | "bullet" | "explode";

export type GoalCellFace = {
    tile: GoalCellTile;
    mark: GoalCellMark;
};
