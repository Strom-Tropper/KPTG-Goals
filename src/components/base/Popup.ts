import { Container, Graphics, Point, Ticker } from "pixi.js";
import { Bounds } from "@/shared/types/common";
import { drawGraphicsRect } from "@/shared/utils/drawGrapicsRect";
import { delay } from "@/shared/utils/delay";
import {
    DEFAULT_GAME_HEIGHT,
    DEFAULT_GAME_WIDTH,
} from "@/shared/constants/settings";

type PopupConfig = Partial<{
    animationDurationMs: number;
    closeOnEscape: boolean;
    closeOnOverlay: boolean;
    closeOnContentClick: boolean;
    initialScale: number;
    overlayAlpha: number;
    targetScale: number;
    ticker: Ticker;
}>;

type HideOptions = Partial<{
    animated: boolean;
    callback: () => void;
    destroyOnHide: boolean;
}>;

type AnimationState = {
    durationMs: number;
    fromContentAlpha: number;
    fromOverlayAlpha: number;
    fromScale: number;
    onComplete?: () => void;
    toContentAlpha: number;
    toOverlayAlpha: number;
    toScale: number;
};

const DEFAULT_ANIMATION_DURATION_MS = 280;
const DEFAULT_INITIAL_SCALE = 0.72;
const DEFAULT_OVERLAY_ALPHA = 0.6;
const DEFAULT_TARGET_SCALE = 1;

function clampProgress(progress: number) {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    return progress;
}

function easeOutBack(t: number) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInBack(t: number) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
}

function interpolate(from: number, to: number, progress: number) {
    return from + (to - from) * progress;
}

export default class Popup extends Container {
    private static visiblePopupCount = 0;

    static hasVisiblePopup() {
        return Popup.visiblePopupCount > 0;
    }

    content: Container;

    readonly overlay: Graphics;

    private readonly animationDurationMs: number;

    private animationListener: (() => void) | null = null;

    private closeOnEscape: boolean;

    private closeOnOverlay: boolean;

    private closeOnContentClick: boolean;

    private readonly initialScale: number;

    private isDestroyed = false;

    private contentLayoutScale = 1;

    private contentAnimationScale: number;

    private readonly overlayAlpha: number;

    private resizeFrame: number | null = null;

    private readonly targetScale: number;

    private readonly ticker: Ticker | null;

    handleKeyDown = (event: KeyboardEvent) => {
        if (!this.closeOnEscape || !this.isVisible()) return;
        if (event.key !== "Escape") return;
        this.hide();
    };

    private readonly handleOverlayPointerDown = () => {
        if (!this.closeOnOverlay) return;
        this.hide();
    };

    private readonly handleContentPointerDown = () => {
        if (!this.closeOnContentClick) return;
        this.hide();
    };

    private readonly handleViewportResize = () => {
        if (!this.isVisible() || this.isDestroyed) return;

        if (typeof requestAnimationFrame === "undefined") {
            this.refreshOverlayBounds();
            return;
        }

        if (this.resizeFrame !== null) {
            cancelAnimationFrame(this.resizeFrame);
        }
        this.resizeFrame = requestAnimationFrame(() => {
            this.resizeFrame = null;
            this.refreshOverlayBounds();
        });
    };

    constructor(config: PopupConfig = {}) {
        super();
        this.animationDurationMs =
            config.animationDurationMs ?? DEFAULT_ANIMATION_DURATION_MS;
        this.closeOnEscape = config.closeOnEscape ?? true;
        this.closeOnOverlay = config.closeOnOverlay ?? true;
        this.closeOnContentClick = config.closeOnContentClick ?? false;

        this.initialScale = config.initialScale ?? DEFAULT_INITIAL_SCALE;
        this.contentAnimationScale = this.initialScale;
        this.overlayAlpha = config.overlayAlpha ?? DEFAULT_OVERLAY_ALPHA;
        this.targetScale = config.targetScale ?? DEFAULT_TARGET_SCALE;
        this.ticker = config.ticker ?? null;

        this.sortableChildren = true;
        this.eventMode = "static";
        this.visible = false;

        this.overlay = new Graphics();
        this.setOverlayBounds(this.getFullscreenOverlayBounds());
        this.overlay.alpha = 0;
        this.overlay.eventMode = "static";
        this.overlay.cursor = "default";
        this.overlay.zIndex = 0;
        this.addOverlayPointerDownListener();

        this.content = new Container();
        this.content.alpha = 0;
        this.content.scale.set(this.initialScale);
        this.content.zIndex = 1;
        this.content.eventMode = "passive";
        this.content.sortableChildren = true;
        this.content.label = "content";
        this.addChild(this.overlay);
        this.addChild(this.content);
    }

    override destroy(options?: Parameters<Container["destroy"]>[0]) {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        this.setVisibleState(false);
        this.removeEscapeListener();
        this.removeResizeListeners();
        this.removeOverlayPointerDownListener();
        this.removeContentPointerDownListener();
        this.stopAnimation();
        super.destroy(
            options && typeof options === "object"
                ? { ...options, children: true }
                : { children: true },
        );
    }

    hide(options: HideOptions = {}) {
        if (this.isDestroyed) return;

        const animated = options.animated ?? true;
        const destroyOnHide = options.destroyOnHide ?? false;
        const callback = options.callback;

        if (!this.isVisible()) {
            callback?.();
            if (destroyOnHide) {
                this.destroy();
            }
            return;
        }

        this.removeEscapeListener();
        this.removeOverlayPointerDownListener();
        this.removeContentPointerDownListener();

        if (!animated || this.animationDurationMs <= 0 || !this.ticker) {
            this.stopAnimation();
            this.applyState(0, 0, this.initialScale);
            this.setVisibleState(false);
            callback?.();
            if (destroyOnHide) {
                this.destroy();
            }
            return;
        }
        if (this.closeOnContentClick) {
            void delay(300).then(() => {
                this.animate({
                    durationMs: this.animationDurationMs,
                    fromContentAlpha: this.content.alpha,
                    fromOverlayAlpha: this.overlay.alpha,
                    fromScale: this.contentAnimationScale,
                    onComplete: () => {
                        this.setVisibleState(false);
                        this.applyState(0, 0, this.initialScale);
                        callback?.();
                        if (destroyOnHide) {
                            this.destroy();
                        }
                    },
                    toContentAlpha: 0,
                    toOverlayAlpha: 0,
                    toScale: this.initialScale,
                });
            });
        } else {
            this.animate({
                durationMs: this.animationDurationMs,
                fromContentAlpha: this.content.alpha,
                fromOverlayAlpha: this.overlay.alpha,
                fromScale: this.contentAnimationScale,
                onComplete: () => {
                    this.setVisibleState(false);
                    this.applyState(0, 0, this.initialScale);
                    callback?.();
                    if (destroyOnHide) {
                        this.destroy();
                    }
                },
                toContentAlpha: 0,
                toOverlayAlpha: 0,
                toScale: this.initialScale,
            });
        }
    }

    isVisible() {
        return this.visible;
    }

    show(callback?: () => void) {
        if (this.isDestroyed) return;

        this.setOverlayBounds(this.getFullscreenOverlayBounds());
        this.setVisibleState(true);
        this.addEscapeListener();
        this.addOverlayPointerDownListener();

        this.addContentPointerDownListener();

        if (this.animationDurationMs <= 0 || !this.ticker) {
            this.stopAnimation();
            this.applyState(this.overlayAlpha, 1, this.targetScale);
            callback?.();
            return;
        }

        this.animate({
            durationMs: this.animationDurationMs,
            fromContentAlpha: this.content.alpha > 0 ? this.content.alpha : 0,
            fromOverlayAlpha: this.overlay.alpha > 0 ? this.overlay.alpha : 0,
            fromScale:
                this.contentAnimationScale > 0
                    ? this.contentAnimationScale
                    : this.initialScale,
            onComplete: callback,
            toContentAlpha: 1,
            toOverlayAlpha: this.overlayAlpha,
            toScale: this.targetScale,
        });
    }

    showImmediately(callback?: () => void) {
        if (this.isDestroyed) return;

        this.setOverlayBounds(this.getFullscreenOverlayBounds());
        this.setVisibleState(true);
        this.addEscapeListener();
        this.addOverlayPointerDownListener();
        this.addContentPointerDownListener();
        this.stopAnimation();
        this.applyState(this.overlayAlpha, 1, this.targetScale);
        callback?.();
    }

    setOverlayBounds(bounds: Bounds) {
        drawGraphicsRect(this.overlay, bounds, 0x000000, 1);
    }

    setContentLayoutScale(scale: number) {
        this.contentLayoutScale =
            Number.isFinite(scale) && scale > 0 ? scale : 0.01;
        this.applyContentScale();
    }

    setCloseOnEscape(value: boolean) {
        this.closeOnEscape = value;
        if (this.isVisible() && this.closeOnEscape) {
            this.addEscapeListener();
            return;
        }
        this.removeEscapeListener();
    }

    setCloseOnOverlay(value: boolean) {
        this.closeOnOverlay = value;
    }

    setCloseOnContentClick(value: boolean) {
        this.closeOnContentClick = value;
    }

    private addEscapeListener() {
        if (!this.closeOnEscape || typeof window === "undefined") return;
        window.removeEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keydown", this.handleKeyDown);
    }

    private addOverlayPointerDownListener() {
        this.overlay.off("pointerdown", this.handleOverlayPointerDown);
        this.overlay.on("pointerdown", this.handleOverlayPointerDown);
    }

    private removeOverlayPointerDownListener() {
        this.overlay.off("pointerdown", this.handleOverlayPointerDown);
    }

    private addContentPointerDownListener() {
        if (!this.closeOnContentClick) return;
        this.off("pointerdown", this.handleContentPointerDown);
        this.on("pointerdown", this.handleContentPointerDown);
    }

    private removeContentPointerDownListener() {
        this.off("pointerdown", this.handleContentPointerDown);
    }

    private animate(state: AnimationState) {
        if (!this.ticker) {
            this.applyState(
                state.toOverlayAlpha,
                state.toContentAlpha,
                state.toScale,
            );
            state.onComplete?.();
            return;
        }

        this.stopAnimation();
        this.applyState(
            state.fromOverlayAlpha,
            state.fromContentAlpha,
            state.fromScale,
        );

        let elapsedMs = 0;
        const isShowing = state.toScale >= state.fromScale;

        this.animationListener = () => {
            if (!this.ticker) return;

            elapsedMs = Math.min(
                elapsedMs + this.ticker.deltaMS,
                state.durationMs,
            );
            const rawProgress =
                state.durationMs <= 0 ? 1 : elapsedMs / state.durationMs;
            const easedProgress = isShowing
                ? easeOutBack(clampProgress(rawProgress))
                : easeInBack(clampProgress(rawProgress));

            this.applyState(
                interpolate(
                    state.fromOverlayAlpha,
                    state.toOverlayAlpha,
                    easedProgress,
                ),
                interpolate(
                    state.fromContentAlpha,
                    state.toContentAlpha,
                    easedProgress,
                ),
                interpolate(state.fromScale, state.toScale, easedProgress),
            );

            if (elapsedMs < state.durationMs) return;

            this.stopAnimation();
            this.applyState(
                state.toOverlayAlpha,
                state.toContentAlpha,
                state.toScale,
            );
            state.onComplete?.();
        };

        this.ticker.add(this.animationListener);
    }

    private applyState(
        overlayAlpha: number,
        contentAlpha: number,
        contentScale: number,
    ) {
        this.overlay.alpha = overlayAlpha;
        this.content.alpha = contentAlpha;
        this.contentAnimationScale = contentScale;
        this.applyContentScale();
    }

    private applyContentScale() {
        this.content.scale.set(
            this.contentAnimationScale * this.contentLayoutScale,
        );
    }

    private getFullscreenOverlayBounds(): Bounds {
        const { width, height } = this.getCanvasLogicalSize();
        const corners = [
            this.toLocal(new Point(0, 0)),
            this.toLocal(new Point(width, 0)),
            this.toLocal(new Point(width, height)),
            this.toLocal(new Point(0, height)),
        ];
        const left = Math.min(...corners.map((corner) => corner.x));
        const right = Math.max(...corners.map((corner) => corner.x));
        const top = Math.min(...corners.map((corner) => corner.y));
        const bottom = Math.max(...corners.map((corner) => corner.y));

        return {
            bottom,
            height: bottom - top,
            left,
            right,
            top,
            width: right - left,
        };
    }

    private getCanvasLogicalSize() {
        if (typeof document === "undefined") {
            return {
                width: DEFAULT_GAME_WIDTH,
                height: DEFAULT_GAME_HEIGHT,
            };
        }

        const gameId = import.meta.env.VITE_GAME_ID ?? "app";
        const canvas = document.getElementById(gameId)?.querySelector("canvas");

        return {
            width:
                Number.parseFloat(canvas?.style.width ?? "") ||
                canvas?.width ||
                DEFAULT_GAME_WIDTH,
            height:
                Number.parseFloat(canvas?.style.height ?? "") ||
                canvas?.height ||
                DEFAULT_GAME_HEIGHT,
        };
    }

    private removeEscapeListener() {
        if (typeof window === "undefined") return;
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    private addResizeListeners() {
        if (typeof window === "undefined") return;
        window.removeEventListener("resize", this.handleViewportResize);
        window.removeEventListener(
            "orientationchange",
            this.handleViewportResize,
        );
        window.visualViewport?.removeEventListener(
            "resize",
            this.handleViewportResize,
        );
        window.addEventListener("resize", this.handleViewportResize);
        window.addEventListener("orientationchange", this.handleViewportResize);
        window.visualViewport?.addEventListener(
            "resize",
            this.handleViewportResize,
        );
    }

    private removeResizeListeners() {
        if (typeof window !== "undefined") {
            window.removeEventListener("resize", this.handleViewportResize);
            window.removeEventListener(
                "orientationchange",
                this.handleViewportResize,
            );
            window.visualViewport?.removeEventListener(
                "resize",
                this.handleViewportResize,
            );
        }
        if (
            this.resizeFrame !== null &&
            typeof cancelAnimationFrame !== "undefined"
        ) {
            cancelAnimationFrame(this.resizeFrame);
        }
        this.resizeFrame = null;
    }

    private refreshOverlayBounds() {
        if (!this.isVisible() || this.isDestroyed) return;
        this.setOverlayBounds(this.getFullscreenOverlayBounds());
    }

    private stopAnimation() {
        if (!this.ticker || !this.animationListener) return;
        this.ticker.remove(this.animationListener);
        this.animationListener = null;
    }

    private setVisibleState(nextVisible: boolean) {
        if (this.visible === nextVisible) return;

        this.visible = nextVisible;
        if (nextVisible) {
            Popup.visiblePopupCount += 1;
            this.addResizeListeners();
            return;
        }

        Popup.visiblePopupCount = Math.max(0, Popup.visiblePopupCount - 1);
        this.removeResizeListeners();
    }
}
