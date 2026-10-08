import { Application, Renderer } from "pixi.js";
import type { Scene } from "@/scenes/Scene";
import { GoalBoard } from "@/scenes/GoalBoard";
import { loadGoalBoardArt } from "@/scenes/goal-board-art";
import {
    GOAL_BET_LEVELS,
    GOAL_COLUMN_COUNT,
    GOAL_ERROR_CODES,
    GOAL_TURN_MS,
    goalMultiplierText,
} from "@/modules/game/engine/goal-constants";
import { goalEngine } from "@/modules/game/engine/goal-engine";
import { GOAL_EVENT_NAMES, goalEvents } from "@/modules/game/engine/goal-events";
import { goalState } from "@/modules/game/engine/goal-state";
import type { GoalPickResult, GoalPlayResult } from "@/modules/game/engine/goal-types";
import { gameState } from "@/modules/game/engine/game.state";
import { i18n } from "@/shared/i18n/I18nManager";
import { format } from "@/shared/utils/formatNumber";

const PLAY_PURSE = 50_000_000;

export class GameScene implements Scene {
    private readonly app: Application<Renderer>;
    private readonly board: GoalBoard;
    private awaitingPointer = false;
    private turnTimer: ReturnType<typeof setInterval> | null = null;
    private turnId = 0;
    private readonly unlisten: Array<() => void> = [];
    private destroyed = false;

    constructor(
        app: Application<Renderer>,
        _token: string,
        _initialLanguage: string,
        _audioUrls: ReadonlyMap<string, string>,
    ) {
        this.app = app;
        this.board = new GoalBoard({
            onBet: this.onBet,
            onOpenBetList: this.onOpenBetList,
            onChooseBet: this.onChooseBet,
            onResetBet: this.onResetBet,
            onMain: this.onMain,
            onPick: this.onPick,
            onRandom: this.onRandom,
        });
        this.app.stage.addChild(this.board);
        this.listen();
        void this.mount();
    }

    private mount = async (): Promise<void> => {
        if (gameState.balance <= 0) gameState.balance = PLAY_PURSE;

        const art = await loadGoalBoardArt();
        if (this.destroyed) return;

        this.board.setArt(art);
        this.paint();
        this.app.renderer.on("resize", this.paint);
    };

    pause(): void {}

    resume(): void {}

    destroy(): void {
        if (this.destroyed) return;

        this.destroyed = true;
        for (const stop of this.unlisten) stop();
        this.unlisten.length = 0;
        this.clearTurnTimer();
        this.app.renderer.off("resize", this.paint);
        this.board.destroy({ children: true });
    }

    private paint = (): void => {
        const round = goalState.round;
        const playing = round.phase === "playing";
        const shownColumn = round.phase === "standby" ? round.column ?? null : round.column;
        const multipliers =
            shownColumn === null
                ? []
                : Array.from({ length: shownColumn + 1 }, (_, column) => ({
                      column,
                      text: goalMultiplierText(column),
                      passed: !playing || column < shownColumn,
                  }));

        this.board.show({
            width: this.app.screen.width,
            height: this.app.screen.height,
            cells: goalState.cells,
            multipliers,
            secondsLeft: goalState.secondsLeft,
            balanceText: i18n.t("goal.balance"),
            balanceDetail: format(gameState.balance),
            randomText: i18n.t("goal.random"),
            randomEnabled: goalEngine.CanRandom(),
            mainLabel: playing
                ? i18n.t("goal.cashout")
                : i18n.t("goal.play"),
            mainDetail:
                playing && round.cashoutAmount > 0
                    ? format(round.cashoutAmount)
                    : null,
            mainEnabled: playing ? goalEngine.CanCashout() : goalEngine.CanPlay(),
            betLines: [
                i18n.t("goal.betLevel", { level: goalEngine.BetLevelNumber() }),
                format(round.betLevel),
            ],
            betSelectable: goalEngine.CanChangeBet(),
            betListOpen: goalState.betListOpen,
            betChoices: GOAL_BET_LEVELS.map((amount, index) => ({
                text: `${i18n.t("goal.betLevel", { level: index + 1 })} : ${format(amount)}`,
                selected: index === goalEngine.BetLevelNumber() - 1,
            })),
            minusEnabled: goalEngine.CanDecreaseBet(),
            plusEnabled: goalEngine.CanIncreaseBet(),
            resetText: i18n.t("goal.resetBet"),
            resetEnabled: goalEngine.CanReset(),
            historyEnabled: round.phase !== "playing",
            notice: this.notice(),
        });
    };

    private listen(): void {
        this.unlisten.push(
            goalEvents.on(GOAL_EVENT_NAMES.BET_LEVEL_CHANGED, () => this.paint()),
            goalEvents.on(GOAL_EVENT_NAMES.ERROR, () => this.paint()),
            goalEvents.on(GOAL_EVENT_NAMES.PLAY_STARTED, (payload) => {
                const result = payload as GoalPlayResult & { ok: true };
                gameState.balance -= result.stake;
                this.beginTurn();
                this.paint();
            }),
            goalEvents.on(GOAL_EVENT_NAMES.PRESENTATION_LOCK_CHANGED, () => this.paint()),
            goalEvents.on(GOAL_EVENT_NAMES.BET_LIST_CHANGED, () => this.paint()),
            goalEvents.on(GOAL_EVENT_NAMES.SECONDS_CHANGED, () => {
                this.board.setSeconds(goalState.secondsLeft);
            }),
            goalEvents.on(GOAL_EVENT_NAMES.PICK_RESOLVED, (payload) => {
                this.onPickResolved(payload as GoalPickResult);
            }),
            goalEvents.on(GOAL_EVENT_NAMES.CASHOUT, (payload) => {
                const result = payload as GoalPickResult;
                this.pay(result.cashedOut);
                this.stopRoundClock();
                this.paint();
            }),
            goalEvents.on(GOAL_EVENT_NAMES.STANDBY, () => {
                this.stopRoundClock();
                this.paint();
            }),
        );
    }

    private onBet = (direction: -1 | 1): void => {
        if (this.awaitingPointer || !goalEngine.CanChangeBet()) return;

        goalEngine.ChangeBetLevel(direction);
    };

    private onOpenBetList = (): void => {
        if (this.awaitingPointer || !goalEngine.CanChangeBet()) return;

        this.afterPointer(() => goalEngine.ToggleBetList());
    };

    private onResetBet = (): void => {
        if (this.awaitingPointer || !goalEngine.CanReset()) return;

        this.afterPointer(() => goalEngine.ResetBet());
    };

    private onChooseBet = (index: number): void => {
        if (this.awaitingPointer || !goalEngine.CanChangeBet()) return;

        this.afterPointer(() => goalEngine.SetBetLevel(index));
    };

    private onMain = (): void => {
        if (this.awaitingPointer || goalEngine.IsPresentationLocked()) return;

        this.afterPointer(() => this.pressMain());
    };

    private pressMain(): void {
        if (goalEngine.IsPresentationLocked()) return;

        if (goalState.round.phase === "playing") {
            goalEngine.Cashout();
            return;
        }

        goalEngine.Play(gameState.balance, units(GOAL_COLUMN_COUNT));
    };

    private onRandom = (): void => {
        if (this.awaitingPointer || !goalEngine.CanRandom()) return;

        const slot = goalEngine.RandomSlot(unit());
        this.afterPointer(() => this.resolvePick(slot));
    };

    private onPick = (slot: number): void => {
        if (this.awaitingPointer || goalEngine.IsPresentationLocked()) return;
        if (goalState.round.phase !== "playing") return;

        this.afterPointer(() => this.resolvePick(slot));
    };

    private afterPointer(action: () => void): void {
        this.awaitingPointer = true;
        requestAnimationFrame(() => {
            if (this.destroyed) return;

            this.awaitingPointer = false;
            action();
        });
    }

    private resolvePick(slot: number): void {
        if (goalState.round.phase !== "playing") return;

        goalEngine.Pick(slot);
    }

    private onPickResolved(result: GoalPickResult): void {
        if (result.lost || result.cashedOut > 0) {
            if (result.cashedOut > 0) this.pay(result.cashedOut);
            this.stopRoundClock();
            this.paint();
            return;
        }

        this.paint();
    }

    private beginTurn(): void {
        this.clearTurnTimer();
        const turnId = this.turnId;
        const started = performance.now();
        goalEngine.SetSecondsLeft(Math.ceil(GOAL_TURN_MS / 1000));
        this.turnTimer = setInterval(() => {
            if (turnId !== this.turnId || this.destroyed) return;
            if (goalState.round.phase !== "playing" || goalEngine.IsPresentationLocked()) return;
            if (this.awaitingPointer) return;

            const left = GOAL_TURN_MS - (performance.now() - started);
            const seconds = Math.max(0, Math.ceil(left / 1000));
            if (seconds !== goalEngine.SecondsLeft()) goalEngine.SetSecondsLeft(seconds);

            if (left <= 0) {
                this.clearTurnTimer();
                this.settleTimeout();
            }
        }, 200);
    }

    private settleTimeout(): void {
        if (goalState.round.phase !== "playing" || goalEngine.IsPresentationLocked()) return;

        goalEngine.TakeCashout();
    }

    private notice(): string | null {
        const error = goalState.error;
        if (error === GOAL_ERROR_CODES.INSUFFICIENT_BALANCE) {
            return i18n.t("goal.insufficientBalance");
        }
        if (error === GOAL_ERROR_CODES.INVALID_SLOT) {
            return i18n.t("goal.invalidSlot");
        }
        if (error === GOAL_ERROR_CODES.INVALID_STATE) {
            return i18n.t("goal.invalidState");
        }
        return null;
    }

    private stopRoundClock(): void {
        this.clearTurnTimer();
    }

    private pay(amount: number): void {
        if (amount > 0) gameState.balance += amount;
    }

    private clearTurnTimer(): void {
        this.turnId += 1;
        if (!this.turnTimer) return;

        clearInterval(this.turnTimer);
        this.turnTimer = null;
    }
}

function unit(): number {
    return Math.random();
}

function units(count: number): number[] {
    return Array.from({ length: count }, () => Math.random());
}
