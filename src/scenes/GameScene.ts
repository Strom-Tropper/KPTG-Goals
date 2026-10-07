import { Application, Renderer } from "pixi.js";
import type { Scene } from "@/scenes/Scene";
import { GoalBoard } from "@/scenes/GoalBoard";
import { loadGoalBoardArt } from "@/scenes/goal-board-art";
import { GOAL_TURN_MS, goalMultiplierText } from "@/modules/game/engine/goal-constants";
import { goalEngine } from "@/modules/game/engine/goal-engine";
import { goalState } from "@/modules/game/engine/goal-state";
import type { GoalRound } from "@/modules/game/engine/goal-types";
import { gameState } from "@/modules/game/engine/game.state";
import { i18n } from "@/shared/i18n/I18nManager";
import { format } from "@/shared/utils/formatNumber";

const PLAY_PURSE = 50_000_000;
const BOOM_PAUSE_MS = 1_200;

export class GameScene implements Scene {
    private readonly app: Application<Renderer>;
    private readonly board: GoalBoard;
    private busy = false;
    private secondsLeft: number | null = null;
    private turnTimer: ReturnType<typeof setInterval> | null = null;
    private turnId = 0;
    private boomTimer: ReturnType<typeof setTimeout> | null = null;
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
            onMain: this.onMain,
            onPick: this.onPick,
            onRandom: this.onRandom,
        });
        this.app.stage.addChild(this.board);
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
        this.clearTurnTimer();
        this.clearBoomTimer();
        this.app.renderer.off("resize", this.paint);
        this.board.destroy({ children: true });
    }

    private paint = (): void => {
        const round = goalState.round;
        const playing = round.phase === "playing";
        const activeColumn = playing ? round.column : null;

        this.board.show({
            width: this.app.screen.width,
            height: this.app.screen.height,
            cells: goalState.cells,
            pastColumn: null,
            nextColumn: activeColumn,
            pastMultiplier: null,
            nextMultiplier:
                activeColumn === null ? null : goalMultiplierText(activeColumn),
            secondsLeft: this.secondsLeft,
            balanceText: i18n.t("goal.balance"),
            balanceDetail: format(gameState.balance),
            randomText: i18n.t("goal.random"),
            randomEnabled: goalEngine.CanRandom() && !this.busy,
            mainLabel: playing
                ? i18n.t("goal.cashout")
                : i18n.t("goal.play"),
            mainDetail:
                playing && round.cashoutAmount > 0
                    ? format(round.cashoutAmount)
                    : null,
            mainEnabled: playing
                ? goalEngine.CanCashout() && !this.busy
                : goalEngine.CanPlay() && !this.busy,
            betCaption: i18n.t("goal.betLevel"),
            betText: format(round.betLevel),
            betEnabled: goalEngine.CanChangeBet() && !this.busy,
        });
    };

    private onBet = (direction: -1 | 1): void => {
        if (this.busy || !goalEngine.CanChangeBet()) return;

        goalEngine.ChangeBetLevel(direction);
        this.paint();
    };

    private onMain = (): void => {
        if (this.busy) return;

        this.afterPointer(() => this.pressMain());
    };

    private pressMain(): void {
        if (this.busy) return;

        if (goalState.round.phase === "playing") {
            const result = goalEngine.Cashout();
            if (result.cashedOut <= 0 && result.round === goalState.round) return;

            this.pay(result.cashedOut);
            this.enterStandby(result.round);
            return;
        }

        if (!goalEngine.CanPlay()) return;

        const result = goalEngine.Play(gameState.balance, unit());
        if (!result.ok) return;

        gameState.balance -= result.stake;
        this.beginTurn();
        this.paint();
    };

    private onRandom = (): void => {
        if (this.busy || !goalEngine.CanRandom()) return;

        const slot = goalEngine.RandomSlot(unit());
        this.afterPointer(() => this.resolvePick(slot));
    };

    private onPick = (slot: number): void => {
        if (this.busy || goalState.round.phase !== "playing") return;

        this.afterPointer(() => this.resolvePick(slot));
    };

    private afterPointer(action: () => void): void {
        this.busy = true;
        requestAnimationFrame(() => {
            if (this.destroyed) return;

            this.busy = false;
            action();
        });
    }

    private resolvePick(slot: number): void {
        if (goalState.round.phase !== "playing") return;

        const result = goalEngine.Pick(slot, unit());
        this.clearTurnTimer();

        if (result.lost) {
            this.busy = true;
            this.secondsLeft = null;
            this.paint();
            this.boomTimer = setTimeout(() => {
                this.boomTimer = null;
                if (this.destroyed) return;

                this.busy = false;
                this.enterStandby(result.round);
            }, BOOM_PAUSE_MS);
            return;
        }

        if (result.cashedOut > 0) {
            this.pay(result.cashedOut);
            this.enterStandby(result.round);
            return;
        }

        this.beginTurn();
        this.paint();
    }

    private beginTurn(): void {
        this.clearTurnTimer();
        const turnId = this.turnId;
        const started = performance.now();
        this.secondsLeft = Math.ceil(GOAL_TURN_MS / 1000);
        this.turnTimer = setInterval(() => {
            if (turnId !== this.turnId || this.destroyed) return;
            if (goalState.round.phase !== "playing" || this.busy) return;

            const left = GOAL_TURN_MS - (performance.now() - started);
            const seconds = Math.max(0, Math.ceil(left / 1000));
            if (seconds !== this.secondsLeft) {
                this.secondsLeft = seconds;
                this.board.setSeconds(seconds);
            }

            if (left <= 0) {
                this.clearTurnTimer();
                this.settleTimeout();
            }
        }, 200);
    }

    private settleTimeout(): void {
        if (goalState.round.phase !== "playing" || this.busy) return;

        const result = goalEngine.TakeCashout();
        this.pay(result.cashedOut);
        this.enterStandby(result.round);
    }

    private enterStandby(round: GoalRound): void {
        this.clearTurnTimer();
        goalEngine.ApplyRound(round);
        this.secondsLeft = null;
        this.paint();
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

    private clearBoomTimer(): void {
        if (!this.boomTimer) return;

        clearTimeout(this.boomTimer);
        this.boomTimer = null;
    }
}

function unit(): number {
    return Math.random();
}
