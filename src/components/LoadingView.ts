import { Container, Graphics, Text, Ticker } from "pixi.js";
import { i18n } from "@/shared/i18n/I18nManager";
import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
import {
    GOAL_BACKGROUND,
    GOAL_FRAME,
    GOAL_INK,
    GOAL_KNOB,
} from "@/shared/constants/goal";

const BAR_WIDTH = 520;
const BAR_HEIGHT = 18;
const PROGRESS_TWEEN_DURATION = 250;

export class LoadingView extends Container {
    private readonly plate: Graphics;
    private readonly fill: Graphics;
    private readonly caption: Text;
    private displayedProgressPercent = 0;
    private progress = 0;
    private targetProgress = 0;
    private progressTweenStartValue = 0;
    private progressTweenStartTime = 0;
    private completeProgressResolve: (() => void) | undefined;
    private readonly ticker: Ticker | null;
    private viewWidth = 0;
    private viewHeight = 0;

    constructor(ticker: Ticker | null = null) {
        super();
        this.ticker = ticker;
        this.zIndex = 2000;
        this.eventMode = "static";

        this.plate = new Graphics();
        this.fill = new Graphics();
        this.caption = createText({
            text: i18n.t("loading.progress", { progress: 0 }),
            fontFamily: FONT_FAMILY.EB_GARAMOND,
            fontSize: 42,
            fill: GOAL_INK,
        });
        this.caption.anchor.set(0.5);

        this.addChild(this.plate, this.fill, this.caption);
        this.ticker?.add(this.animateProgress);
    }

    resize(width: number, height: number): void {
        this.viewWidth = width;
        this.viewHeight = height;
        this.draw();
    }

    setProgress(value: number): void {
        const nextProgress = Math.max(0, Math.min(1, value));
        this.targetProgress = Math.max(this.targetProgress, nextProgress);
        this.progressTweenStartValue = this.progress;
        this.progressTweenStartTime = Date.now();

        if (!this.ticker) {
            this.progress = this.targetProgress;
            this.draw();
            this.resolveCompleteProgress();
        }
    }

    completeProgress(): Promise<void> {
        this.setProgress(1);
        if (this.progress >= 1) return Promise.resolve();

        return new Promise((resolve) => {
            this.completeProgressResolve = resolve;
        });
    }

    override destroy(options?: Parameters<Container["destroy"]>[0]): void {
        this.ticker?.remove(this.animateProgress);
        this.completeProgressResolve = undefined;
        super.destroy(options);
    }

    private animateProgress = (): void => {
        if (this.progress === this.targetProgress) return;

        const elapsed = Date.now() - this.progressTweenStartTime;
        const tween = Math.min(elapsed / PROGRESS_TWEEN_DURATION, 1);
        const eased = 1 - (1 - tween) ** 3;
        this.progress =
            this.progressTweenStartValue +
            (this.targetProgress - this.progressTweenStartValue) * eased;
        if (tween >= 1) {
            this.progress = this.targetProgress;
            this.resolveCompleteProgress();
        }
        this.draw();
    };

    private draw(): void {
        const width = this.viewWidth;
        const height = this.viewHeight;
        const barWidth = Math.min(BAR_WIDTH, Math.max(160, width * 0.36));
        const barX = (width - barWidth) / 2;
        const barY = height * 0.62;

        this.plate.clear();
        this.plate.rect(0, 0, width, height).fill(GOAL_BACKGROUND);
        this.plate
            .roundRect(barX, barY, barWidth, BAR_HEIGHT, BAR_HEIGHT / 2)
            .fill(GOAL_KNOB);

        const fillWidth = Math.max(0, barWidth * this.progress);
        this.fill.clear();
        if (fillWidth > 0) {
            this.fill
                .roundRect(barX, barY, fillWidth, BAR_HEIGHT, BAR_HEIGHT / 2)
                .fill(GOAL_FRAME);
        }

        const progressPercent = Math.floor(this.progress * 100);
        if (progressPercent !== this.displayedProgressPercent) {
            this.displayedProgressPercent = progressPercent;
            this.caption.text = i18n.t("loading.progress", {
                progress: progressPercent,
            });
        }
        this.caption.position.set(width / 2, barY - 48);
    }

    private resolveCompleteProgress(): void {
        if (this.progress < 1 || !this.completeProgressResolve) return;

        this.completeProgressResolve();
        this.completeProgressResolve = undefined;
    }
}
