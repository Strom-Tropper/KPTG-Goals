import { Application, Assets, NineSliceSprite, Renderer, Sprite, Texture } from "pixi.js";
import Popup from "@/components/base/Popup";
import { goalLabel, labeledButton } from "@/components/GameControls";
import { GOAL_EXPLODE, GOAL_INK } from "@/shared/constants/goal";
import { i18n } from "@/shared/i18n/I18nManager";
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
const AUTO_CLOSE_MS = 6_000;
const POPUP_SKIP_HOLD_MS = 1_000;

export class BonusGameLosePopup extends Popup {
    private onClosed?: () => void;
    private closing = false;
    private opening = false;
    private isSkipRequested = false;
    private autoCloseTimer?: ReturnType<typeof setTimeout>;
    private readonly app: Application<Renderer>;
    private readonly line: ReturnType<typeof goalLabel>;
    private readonly ready: Promise<void>;
    private readonly onResize = (): void => this.place();

    constructor(app: Application<Renderer>) {
        super({
            ticker: app.ticker,
            overlayAlpha: 0.7,
            closeOnOverlay: false,
            targetScale: 1.2,
        });
        this.label = "BonusGameLosePopup";
        this.app = app;
        this.line = goalLabel("", 0, -8, 28, GOAL_INK);
        this.content.addChild(
            goalLabel(i18n.t("goal.loseTitle"), 0, -96, 46, GOAL_EXPLODE),
            this.line,
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
            const close = new Sprite(closeTexture);
            close.anchor.set(0.5);
            close.width = CLOSE_SIZE;
            close.height = CLOSE_SIZE;
            close.position.set(PLATE_WIDTH / 2 - 36, -PLATE_HEIGHT / 2 + 36);
            close.eventMode = "static";
            close.cursor = "pointer";
            close.on("pointertap", () => this.hide());
            this.content.addChild(close);
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

    showLoss(amount = 0, onClosed?: () => void): void {
        if (this.destroyed || this.isVisible() || this.opening) return;

        this.opening = true;
        void this.ready.then(() => {
            this.opening = false;
            if (this.destroyed || this.isVisible()) return;

            this.line.text = i18n.t("goal.loseLine", { amount: format(amount) });
            this.onClosed = onClosed;
            this.closing = false;
            this.isSkipRequested = false;
            this.show();
            this.addSkipListener();
            this.autoCloseTimer = setTimeout(() => this.hide(), AUTO_CLOSE_MS);
        });
    }

    override hide(options: Parameters<Popup["hide"]>[0] = {}): void {
        if (this.closing || !this.isVisible()) return;

        this.closing = true;
        this.clearAutoCloseTimer();
        this.removeSkipListener();
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
        this.onClosed = undefined;
        this.app.renderer.off("resize", this.onResize);
        super.destroy(options);
    }

    private readonly requestSkip = (): void => {
        if (!this.isVisible() || this.closing || this.isSkipRequested) return;

        this.isSkipRequested = true;
        this.clearAutoCloseTimer();
        this.autoCloseTimer = setTimeout(() => this.hide(), POPUP_SKIP_HOLD_MS);
    };

    private readonly handlePointerDown = (): void => this.requestSkip();

    private readonly handleSkipKeyDown = (event: KeyboardEvent): void => {
        if (event.code !== "Space") return;

        event.preventDefault();
        this.requestSkip();
    };

    private addSkipListener(): void {
        window.addEventListener("pointerdown", this.handlePointerDown);
        window.addEventListener("keydown", this.handleSkipKeyDown);
    }

    private removeSkipListener(): void {
        window.removeEventListener("pointerdown", this.handlePointerDown);
        window.removeEventListener("keydown", this.handleSkipKeyDown);
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
