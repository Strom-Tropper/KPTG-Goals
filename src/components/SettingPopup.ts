import { Application, Assets, Container, Graphics, NineSliceSprite, Rectangle, Renderer, Sprite, Texture } from "pixi.js";
import Popup from "@/components/base/Popup";
import { goalLabel, labeledButton, type ButtonSkin } from "@/components/GameControls";
import type { HistoryPopupView } from "@/components/HIstoryPopup/HistoryPopup";
import { GOAL_INK, GOAL_KNOB_EDGE } from "@/shared/constants/goal";
import { i18n } from "@/shared/i18n/I18nManager";
import { audioSystem } from "@/systems/audio";
import plateUrl from "../../raw-assets/board{m}{copy}/popup-plate.svg";
import closeUrl from "../../raw-assets/board{m}{copy}/popup-close.svg";
import buttonFaceUrl from "../../raw-assets/board{m}{copy}/button-face.svg";
import buttonFaceHoverUrl from "../../raw-assets/board{m}{copy}/button-face-hover.svg";
import buttonFaceActiveUrl from "../../raw-assets/board{m}{copy}/button-face-active.svg";

const SETTINGS_WIDTH = 640;
const SETTINGS_HEIGHT = 460;
const CLOSE_SIZE = 48;
const BUTTON_WIDTH = 280;
const BUTTON_HEIGHT = 52;
const CHECK_SIZE = 36;

export type SettingsHooks = {
    historyEnabled: () => boolean;
};

export class SettingPopup extends Popup {
    private static instance: SettingPopup | null = null;
    private readonly app: Application<Renderer>;
    private readonly body = new Container();
    private plate: NineSliceSprite | null = null;
    private closeMark: Sprite | null = null;
    private skin: ButtonSkin | null = null;
    private ready: Promise<void> | null = null;
    private hooks: SettingsHooks | null = null;
    private history: HistoryPopupView | null = null;

    private constructor(app: Application<Renderer>) {
        super({
            closeOnEscape: true,
            closeOnOverlay: true,
            ticker: app.ticker ?? null,
        });

        this.app = app;
        this.label = "SettingPopup";
        this.zIndex = 20;
        this.content.addChild(this.body);
        this.place();
        this.app.renderer.on("resize", this.place);
    }

    static show(app: Application<Renderer>, hooks: SettingsHooks, history: HistoryPopupView): void {
        const popup = SettingPopup.open(app, hooks, history);
        void popup.paint().then(() => {
            popup.fillSettings();
            popup.show();
        });
    }

    static close(): void {
        const popup = SettingPopup.instance;
        if (!popup) return;

        popup.app.renderer.off("resize", popup.place);
        popup.destroy();
        SettingPopup.instance = null;
    }

    private static open(
        app: Application<Renderer>,
        hooks: SettingsHooks,
        history: HistoryPopupView,
    ): SettingPopup {
        const popup = SettingPopup.instance ?? new SettingPopup(app);
        SettingPopup.instance = popup;
        popup.hooks = hooks;
        popup.history = history;
        if (!popup.parent) app.stage.addChild(popup);
        popup.place();
        return popup;
    }

    private paint(): Promise<void> {
        if (this.ready) return this.ready;

        this.ready = Promise.all([
            Assets.load<Texture>({ src: plateUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: closeUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: buttonFaceUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: buttonFaceHoverUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: buttonFaceActiveUrl, data: { resolution: 2 } }),
        ]).then(([plateTexture, closeTexture, face, hover, _active]) => {
            if (this.destroyed) return;

            const plate = new NineSliceSprite({
                texture: plateTexture,
                leftWidth: 36,
                topHeight: 36,
                rightWidth: 36,
                bottomHeight: 36,
                width: SETTINGS_WIDTH,
                height: SETTINGS_HEIGHT,
            });
            plate.position.set(-SETTINGS_WIDTH / 2, -SETTINGS_HEIGHT / 2);
            this.plate = plate;
            this.skin = { normal: face, hover, active: face };
            this.content.addChildAt(plate, 0);

            const close = new Sprite(closeTexture);
            close.anchor.set(0.5);
            close.width = CLOSE_SIZE;
            close.height = CLOSE_SIZE;
            close.eventMode = "static";
            close.cursor = "pointer";
            close.on("pointertap", () => this.hide());
            this.closeMark = close;
            this.content.addChild(close);
            this.sizePlate(SETTINGS_WIDTH, SETTINGS_HEIGHT);
        });
        return this.ready;
    }

    private fillSettings(): void {
        const fitted = this.fitted(SETTINGS_WIDTH, SETTINGS_HEIGHT);
        this.sizePlate(fitted.width, fitted.height);
        this.body.removeChildren();
        this.body.addChild(goalLabel(i18n.t("settings.title"), 0, -170, 40, GOAL_KNOB_EDGE));
        this.body.addChild(
            this.audioRow(i18n.t("settings.music"), -70, !audioSystem.isMusicMuted(), this.toggleMusic),
        );
        this.body.addChild(
            this.audioRow(i18n.t("settings.sound"), 0, !audioSystem.isSfxMuted(), this.toggleSound),
        );
        if (!this.skin) return;

        const historyOn = this.hooks?.historyEnabled() ?? false;
        this.body.addChild(
            labeledButton(
                -BUTTON_WIDTH / 2,
                70,
                BUTTON_WIDTH,
                BUTTON_HEIGHT,
                [i18n.t("betHistory.title")],
                historyOn,
                () => {
                    void audioSystem.play("sfx_btn", { singleInstance: true });
                    this.openHistory();
                },
                false,
                this.skin,
            ),
        );
    }

    private openHistory(): void {
        if (!(this.hooks?.historyEnabled() ?? false)) return;
        this.history?.showBetHistory();
        this.hide();
    }

    private fitted(width: number, height: number): { width: number; height: number } {
        return {
            width: Math.min(width, Math.max(360, this.app.screen.width - 48)),
            height: Math.min(height, Math.max(320, this.app.screen.height - 48)),
        };
    }

    private audioRow(label: string, y: number, on: boolean, toggle: () => void): Container {
        const row = new Container();
        row.position.set(0, y);
        row.addChild(goalLabel(label, -24, 0, 28, GOAL_INK));
        const boxX = 150;
        const box = new Graphics();
        box.roundRect(boxX, -CHECK_SIZE / 2, CHECK_SIZE, CHECK_SIZE, 6)
            .fill({ color: 0x1a1a1a })
            .stroke({ color: GOAL_KNOB_EDGE, width: 2 });
        row.addChild(box);
        if (on) {
            const mark = new Graphics();
            mark.moveTo(boxX + 8, 0)
                .lineTo(boxX + 15, 8)
                .lineTo(boxX + 28, -8)
                .stroke({ color: GOAL_KNOB_EDGE, width: 3, cap: "round", join: "round" });
            row.addChild(mark);
        }
        row.hitArea = new Rectangle(-180, -28, 380, 56);
        row.eventMode = "static";
        row.cursor = "pointer";
        row.on("pointertap", toggle);
        return row;
    }

    private toggleMusic = (): void => {
        audioSystem.toggleMusicMute();
        void audioSystem.play("sfx_btn", { singleInstance: true });
        this.fillSettings();
    };

    private toggleSound = (): void => {
        const wasMuted = audioSystem.isSfxMuted();
        if (!wasMuted) void audioSystem.play("sfx_btn", { singleInstance: true });
        audioSystem.toggleSfxMute();
        if (wasMuted) void audioSystem.play("sfx_btn", { singleInstance: true });
        this.fillSettings();
    };

    private sizePlate(width: number, height: number): void {
        if (!this.plate) return;

        this.plate.width = width;
        this.plate.height = height;
        this.plate.position.set(-width / 2, -height / 2);
        this.closeMark?.position.set(width / 2 - 36, -height / 2 + 36);
    }

    private readonly place = (): void => {
        this.content.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    };
}
