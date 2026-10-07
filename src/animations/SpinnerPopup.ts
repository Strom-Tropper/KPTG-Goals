import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { Application, Assets, Cache, Renderer } from "pixi.js";
import { CreateSpine } from "@/shared/utils/createSpine";

import Popup from "@/components/base/Popup";
import {
    DEFAULT_GAME_HEIGHT,
    DEFAULT_GAME_WIDTH,
} from "@/shared/constants/settings";
import {
    SPINNER_ATLAS,
    SPINNER_SKELETON,
    SPINNER_TEXTURE,
} from "./animations.constant";

export class SpinnerPopup extends Popup {
    private static instance: SpinnerPopup | null = null;
    private static readonly SPINNER_BASE_SCALE = 0.5;
    private readonly app: Application<Renderer>;
    private resizeObserver?: ResizeObserver;
    private spinnerSpine: Spine;

    private constructor(app: Application<Renderer>) {
        super({
            closeOnEscape: false,
            closeOnOverlay: false,
            initialScale: 1,
            overlayAlpha: 0.7,
            targetScale: 1,
            ticker: app.ticker ?? null,
        });

        this.app = app;
        this.spinnerSpine = CreateSpine(SPINNER_SKELETON, SPINNER_ATLAS, {
            autoUpdate: false,
        });

        this.applySpinnerLayout();
        this.label = "spinner_spine";
        this.zIndex = 30;

        this.content.addChild(this.spinnerSpine);

        this.spinnerSpine.state.setAnimation(0, "animation", true);
        this.bindResize();
    }

    static getInstance(app?: Application<Renderer>): SpinnerPopup | null {
        if (!SpinnerPopup.instance && app) {
            SpinnerPopup.instance = new SpinnerPopup(app);
        }
        return SpinnerPopup.instance;
    }

    static async unloadAssets(): Promise<void> {
        // Spine.from() stores the parsed SkeletonData under this generated key.
        Cache.remove(`${SPINNER_SKELETON}-${SPINNER_ATLAS}-1`);
        await Assets.unload([SPINNER_SKELETON, SPINNER_ATLAS, SPINNER_TEXTURE]);
    }

    override show(callback?: () => void): void {
        this.spinnerSpine.autoUpdate = true;
        super.show(callback);
    }

    override hide(options: Parameters<Popup["hide"]>[0] = {}): void {
        this.spinnerSpine.autoUpdate = false;
        super.hide(options);
    }

    destroy(...args: Parameters<Popup["destroy"]>) {
        if (this.destroyed) return;
        this.unbindResize();
        this.spinnerSpine.autoUpdate = false;
        if (!this.spinnerSpine.destroyed) {
            this.spinnerSpine.destroy({ children: true });
        }
        super.destroy(...args);
        if (SpinnerPopup.instance === this) {
            SpinnerPopup.instance = null;
        }
    }

    private readonly handleResize = () => {
        this.applySpinnerLayout();
    };

    private bindResize() {
        if (typeof window === "undefined") return;

        window.addEventListener("resize", this.handleResize);
        window.addEventListener("orientationchange", this.handleResize);
        window.visualViewport?.addEventListener("resize", this.handleResize);

        const resizeTarget = this.app.canvas.parentElement ?? this.app.canvas;
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(resizeTarget);
    }

    private unbindResize() {
        if (typeof window === "undefined") return;

        window.removeEventListener("resize", this.handleResize);
        window.removeEventListener("orientationchange", this.handleResize);
        window.visualViewport?.removeEventListener("resize", this.handleResize);
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
    }

    private applySpinnerLayout() {
        const parent = this.app.canvas.parentElement;
        const containerWidth = parent?.clientWidth || window.innerWidth;
        const containerHeight = parent?.clientHeight || window.innerHeight;
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;
        const canvasScaleX = containerWidth / screenWidth;
        const canvasScaleY = containerHeight / screenHeight;
        const isPortrait = containerHeight > containerWidth;
        const layoutWidth = isPortrait
            ? DEFAULT_GAME_HEIGHT
            : DEFAULT_GAME_WIDTH;
        const layoutHeight = isPortrait
            ? DEFAULT_GAME_WIDTH
            : DEFAULT_GAME_HEIGHT;
        const visualScale = Math.min(
            containerWidth / layoutWidth,
            containerHeight / layoutHeight,
        );

        this.content.rotation = 0;
        this.content.position.set(screenWidth / 2, screenHeight / 2);

        if (
            !Number.isFinite(canvasScaleX) ||
            !Number.isFinite(canvasScaleY) ||
            !Number.isFinite(visualScale) ||
            canvasScaleX <= 0 ||
            canvasScaleY <= 0 ||
            visualScale <= 0
        ) {
            this.spinnerSpine.scale.set(SpinnerPopup.SPINNER_BASE_SCALE);
            return;
        }

        this.spinnerSpine.scale.set(
            SpinnerPopup.SPINNER_BASE_SCALE * (visualScale / canvasScaleX),
            SpinnerPopup.SPINNER_BASE_SCALE * (visualScale / canvasScaleY),
        );
    }
}
