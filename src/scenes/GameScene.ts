import { Application, Renderer } from "pixi.js";
import type { Scene } from "@/scenes/Scene";
import { GameBoard } from "@/scenes/GameBoard";
import { loadGameBoardArt } from "@/scenes/GameBoardArt";
import { GOAL_ERROR_CODES, goalMultiplierText } from "@/modules/game/engine/game.constants";
import { goalEngine } from "@/modules/game/engine/game.engine";
import { EVENT_NAMES, eventBus, GOAL_EVENT_NAMES, goalEvents } from "@/modules/game/engine/game.events";
import { goalSession } from "@/modules/game/engine/game.session";
import { gameState, goalState } from "@/modules/game/engine/game.state";
import { gameRequests } from "@/modules/game/handlers/game.requests";
import { i18n } from "@/shared/i18n/I18nManager";
import { format } from "@/shared/utils/formatNumber";

export class GameScene implements Scene {
    private readonly app: Application<Renderer>;
    private readonly board: GameBoard;
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
        this.board = new GameBoard({
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
        const art = await loadGameBoardArt();
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
                      text: this.multiplierLabel(column),
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
            betChoices: goalState.ladder.map((row, index) => ({
                text: `${i18n.t("goal.betLevel", { level: index + 1 })} : ${format(row.bet)}`,
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
            goalEvents.on(GOAL_EVENT_NAMES.PRESENTATION_LOCK_CHANGED, () => this.paint()),
            goalEvents.on(GOAL_EVENT_NAMES.BET_LIST_CHANGED, () => this.paint()),
            goalEvents.on(GOAL_EVENT_NAMES.SECONDS_CHANGED, () => {
                this.board.setSeconds(goalState.secondsLeft);
            }),
            goalEvents.on(GOAL_EVENT_NAMES.SCREEN, () => {
                this.followDeadline();
                this.paint();
            }),
            goalEvents.on(GOAL_EVENT_NAMES.STANDBY, () => {
                this.stopRoundClock();
                this.paint();
            }),
            eventBus.on(EVENT_NAMES.BALANCE_UPDATE_RESPONSE, () => this.paint()),
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
            this.sendTurn((ordinal) => gameRequests.CashoutColumn(ordinal));
            return;
        }

        if (!goalEngine.CanPlay()) return;

        this.sendBare(() => gameRequests.PlayLevel(goalEngine.BetLevelKey()));
    }

    private onRandom = (): void => {
        if (this.awaitingPointer || !goalEngine.CanRandom()) return;

        this.afterPointer(() => this.sendTurn((ordinal) => gameRequests.RandomColumn(ordinal)));
    };

    private onPick = (slot: number): void => {
        if (this.awaitingPointer || goalEngine.IsPresentationLocked()) return;
        if (goalState.round.phase !== "playing") return;

        this.afterPointer(() =>
            this.sendTurn((ordinal) => gameRequests.PickColumn(ordinal, slot)),
        );
    };

    private sendTurn(send: (ordinal: number) => boolean): void {
        const ordinal = goalState.answerOrdinal;
        if (ordinal === null) {
            goalSession.note(i18n.t("goal.notConnected"));
            this.paint();
            return;
        }

        this.sendBare(() => send(ordinal));
    }

    private sendBare(send: () => boolean): void {
        goalEngine.SetPresentationLocked(true);
        if (send()) return;

        goalEngine.SetPresentationLocked(false);
        goalSession.note(i18n.t("goal.notConnected"));
        this.paint();
    }

    private afterPointer(action: () => void): void {
        this.awaitingPointer = true;
        requestAnimationFrame(() => {
            if (this.destroyed) return;

            this.awaitingPointer = false;
            action();
        });
    }

    private followDeadline(): void {
        this.clearTurnTimer();
        const deadline = goalState.deadlineMs;
        if (deadline === null || goalState.round.phase !== "playing") return;

        const turnId = this.turnId;
        this.turnTimer = setInterval(() => {
            if (turnId !== this.turnId || this.destroyed) return;

            const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            if (seconds !== goalEngine.SecondsLeft()) goalEngine.SetSecondsLeft(seconds);
        }, 200);
    }

    private multiplierLabel(column: number): string {
        const x100 = goalState.multipliersX100[column];
        if (x100 === undefined) return goalMultiplierText(column);

        return `${(x100 / 100).toFixed(2)}x`;
    }

    private notice(): string | null {
        if (goalState.notice) return goalState.notice;

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

    private clearTurnTimer(): void {
        this.turnId += 1;
        if (!this.turnTimer) return;

        clearInterval(this.turnTimer);
        this.turnTimer = null;
    }
}
