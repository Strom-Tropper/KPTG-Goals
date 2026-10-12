import { Application, Assets, NineSliceSprite, Renderer, Sprite, Texture, type Ticker, type Text } from "pixi.js";
import Popup from "@/components/base/Popup";
import { goalLabel, labeledButton } from "@/components/GameControls";
import { GOAL_KNOB_EDGE } from "@/shared/constants/goal";
import { i18n } from "@/shared/i18n/I18nManager";
import { animateNumber, type NumberAnimation } from "@/shared/utils/animateNumber";
import { createBlinkAnimation, type BlinkAnimation } from "@/shared/utils/createBlinkAnimation";
import { format } from "@/shared/utils/formatNumber";
import plateUrl from "../../../raw-assets/board{m}{copy}/popup-plate.svg";
import closeUrl from "../../../raw-assets/board{m}{copy}/popup-close.svg";
import buttonFaceUrl from "../../../raw-assets/board{m}{copy}/button-face.svg";
import buttonFaceHoverUrl from "../../../raw-assets/board{m}{copy}/button-face-hover.svg";
import buttonFaceActiveUrl from "../../../raw-assets/board{m}{copy}/button-face-active.svg";

const PLATE_WIDTH = 640;
const PLATE_HEIGHT = 360;
const CLOSE_SIZE = 48;
const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 52;
const AMOUNT_ANIMATION_MS = 1_700;
const POPUP_DURATION_MS = 10_000;
const POPUP_SKIP_HOLD_MS = 2_000;
const AMOUNT_SCALE_PULSE = 0.04;

export class BonusGameWinPopup extends Popup {
    private onClosed?: () => void;
    private closing = false;
    private opening = false;
    private isSkipRequested = false;
    private totalWin = 0;
    private amountAnimation: NumberAnimation | null = null;
    private autoCloseTimer?: ReturnType<typeof setTimeout>;
    private readonly app: Application<Renderer>;
    private readonly amount: Text;
    private readonly amountTicker: Ticker;
    private readonly amountPulse: BlinkAnimation;
    private readonly ready: Promise<void>;
    private readonly onResize = (): void => this.place();

    constructor(app: Application<Renderer>) {
        super({
            ticker: app.ticker,
            overlayAlpha: 0.7,
            closeOnOverlay: false,
        });
        this.label = "BonusGameWinPopup";
        this.app = app;
        this.amountTicker = app.ticker;
        this.amount = goalLabel("0", 0, -8, 52, GOAL_KNOB_EDGE);
        this.amountPulse = createBlinkAnimation({
            target: this.amount,
            ticker: app.ticker,
            scalePulse: AMOUNT_SCALE_PULSE,
            minAlpha: 1,
        });
        this.content.addChild(
            goalLabel(i18n.t("goal.winTitle"), 0, -96, 40, GOAL_KNOB_EDGE),
            this.amount,
        );
        this.ready = Promise.all([
            Assets.load<Texture>({ src: plateUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: closeUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: buttonFaceUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: buttonFaceHoverUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: buttonFaceActiveUrl, data: { resolution: 2 } }),
        ]).then(([plateTexture, closeTexture, face, hover, active]) => {
            if (this.destroyed) return;

            const plate = new NineSliceSprite({
                texture: plateTexture,
                leftWidth: 36,
                topHeight: 36,
                rightWidth: 36,
                bottomHeight: 36,
                width: PLATE_WIDTH,
                height: PLATE_HEIGHT,
            });
            plate.eventMode = "none";
            plate.position.set(-PLATE_WIDTH / 2, -PLATE_HEIGHT / 2);
            this.content.addChildAt(plate, 0);
            this.content.addChild(this.closeMark(closeTexture));
            this.content.addChild(
                labeledButton(
                    -BUTTON_WIDTH / 2,
                    88,
                    BUTTON_WIDTH,
                    BUTTON_HEIGHT,
                    [i18n.t("goal.close")],
                    true,
                    () => this.hide(),
                    false,
                    { normal: face, hover, active },
                ),
            );
        });
        this.place();
        app.renderer.on("resize", this.onResize);
    }

    showWin(totalWin: number, onClosed?: () => void): void {
        if (this.destroyed || this.isVisible() || this.opening) return;

        this.opening = true;
        void this.ready.then(() => {
            this.opening = false;
            if (this.destroyed || this.isVisible()) return;

            this.begin(totalWin, onClosed);
        });
    }

    override hide(options: Parameters<Popup["hide"]>[0] = {}): void {
        if (this.closing || !this.isVisible()) return;

        this.closing = true;
        this.clearAutoCloseTimer();
        this.removeSkipListener();
        this.stopAmountAnimation();
        super.hide({
            ...options,
            callback: () => {
                const onClosed = this.onClosed;
                this.onClosed = undefined;
                this.closing = false;
                options.callback?.();
                onClosed?.();
            },
        });
    }

    override destroy(options?: Parameters<Popup["destroy"]>[0]): void {
        if (this.destroyed) return;

        this.clearAutoCloseTimer();
        this.removeSkipListener();
        this.stopAmountAnimation();
        this.onClosed = undefined;
        this.app.renderer.off("resize", this.onResize);
        super.destroy(options);
    }

    private begin(totalWin: number, onClosed?: () => void): void {
        this.stopAmountAnimation();
        this.updateAmount(0);
        this.totalWin = totalWin;
        this.onClosed = onClosed;
        this.closing = false;
        this.isSkipRequested = false;
        this.show();
        this.addSkipListener();
        this.autoCloseTimer = setTimeout(() => this.hide(), POPUP_DURATION_MS);
        this.amountAnimation = animateNumber({
            from: 0,
            to: totalWin,
            durationMs: AMOUNT_ANIMATION_MS,
            frameMs: 1_000 / 40,
            ticker: this.amountTicker,
            onUpdate: (value) => this.updateAmount(value),
            onComplete: () => {
                this.amountAnimation = null;
                this.amountPulse.start();
            },
        });
    }

    private closeMark(texture: Texture): Sprite {
        const close = new Sprite(texture);
        close.anchor.set(0.5);
        close.width = CLOSE_SIZE;
        close.height = CLOSE_SIZE;
        close.position.set(PLATE_WIDTH / 2 - 36, -PLATE_HEIGHT / 2 + 36);
        close.eventMode = "static";
        close.cursor = "pointer";
        close.on("pointertap", () => this.hide());
        return close;
    }

    private updateAmount(value: number): void {
        this.amount.text = format(value);
        this.amount.scale.set(1);
        this.amountPulse.setBaseScale(this.amount.scale.x);
    }

    private stopAmountAnimation(): void {
        this.amountAnimation?.stop();
        this.amountAnimation = null;
        this.amountPulse.stop();
    }

    private readonly requestSkip = (): void => {
        if (!this.isVisible() || this.closing || this.isSkipRequested) return;

        this.isSkipRequested = true;
        this.stopAmountAnimation();
        this.updateAmount(this.totalWin);
        this.amountPulse.start();
        this.clearAutoCloseTimer();
        this.autoCloseTimer = setTimeout(() => this.hide(), POPUP_SKIP_HOLD_MS);
    };

    private addSkipListener(): void {
        window.addEventListener("pointerdown", this.requestSkip);
    }

    private removeSkipListener(): void {
        window.removeEventListener("pointerdown", this.requestSkip);
    }

    private clearAutoCloseTimer(): void {
        if (this.autoCloseTimer === undefined) return;

        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = undefined;
    }

    private place(): void {
        const width = Math.max(1, this.app.screen.width);
        const height = Math.max(1, this.app.screen.height);
        this.content.position.set(width / 2, height / 2);
        const fit = Math.min(1, (width - 48) / PLATE_WIDTH, (height - 48) / PLATE_HEIGHT);
        this.setContentLayoutScale(fit);
    }
}
