import { Application, Assets, Renderer, Sprite, Texture } from "pixi.js";

import Popup from "@/components/base/Popup";
import { Button, type ButtonTextureStates } from "@/components/base/Button";
import type { MainGameLayoutMode } from "@/components/layouts";
import { audioSystem } from "@/systems/audio";
import { createInfoGoal } from "./InfoGoal";
import panelUrl from "../../../raw-assets/info{m}{copy}/info_panel.png";
import closeNormalUrl from "../../../raw-assets/info{m}{copy}/popup_close_btn_normal.png";
import closeHoverUrl from "../../../raw-assets/info{m}{copy}/popup_close_btn_highlighted.png";
import closePressedUrl from "../../../raw-assets/info{m}{copy}/popup_close_btn_pressed.png";

const PANEL_WIDTH = 1353;
const PANEL_HEIGHT = 911;

export type InfoView = Popup & {
    setLayout: (mode: MainGameLayoutMode) => void;
};

export function createInfoPopup(app: Application<Renderer>): InfoView {
    const infoView = new Popup({
        closeOnEscape: true,
        closeOnOverlay: true,
        initialScale: 0.72,
        overlayAlpha: 0.7,
        targetScale: 1,
        ticker: app.ticker,
    }) as InfoView;

    infoView.label = "InfoView";
    infoView.zIndex = 20;

    const panel = new Sprite(Texture.EMPTY);
    panel.anchor.set(0.5);
    panel.eventMode = "static";
    panel.cursor = "default";
    panel.on("pointerdown", (event) => {
        event.stopPropagation();
    });

    const closeButton = new Button({
        normal: Texture.EMPTY,
        hover: Texture.EMPTY,
        pressed: Texture.EMPTY,
    });
    closeButton.anchor.set(0.5);
    closeButton.position.set(644, -404);

    const place = () => {
        const width = Math.max(1, app.screen.width);
        const height = Math.max(1, app.screen.height);
        infoView.content.position.set(width / 2, height / 2);
        const fit = Math.min(
            1,
            (width - 32) / PANEL_WIDTH,
            (height - 32) / PANEL_HEIGHT,
        );
        infoView.setContentLayoutScale(fit);
    };

    infoView.setLayout = (mode: MainGameLayoutMode) => {
        place();
        panel.setSize(
            mode === "portrait" ? 875 : PANEL_WIDTH,
            mode === "portrait" ? 1375 : PANEL_HEIGHT,
        );
        page.setLayout(mode);
    };

    const ready = Promise.all([
        Assets.load<Texture>(panelUrl),
        Assets.load<Texture>(closeNormalUrl),
        Assets.load<Texture>(closeHoverUrl),
        Assets.load<Texture>(closePressedUrl),
    ]).then(([panelTexture, normal, hover, pressed]) => {
        if (infoView.destroyed) return;

        panel.texture = panelTexture;
        panel.setSize(PANEL_WIDTH, PANEL_HEIGHT);
        const states: ButtonTextureStates = { normal, hover, pressed };
        closeButton.setTextures(states);
        closeButton.updateHitArea();
    });

    const handleClose = () => {
        closeButton.off("pointerup", handleClose);
        void audioSystem.play("sfx_btn", { singleInstance: true });
        infoView.hide({
            callback: () => closeButton.on("pointerup", handleClose),
        });
    };
    closeButton.on("pointerup", handleClose);

    const page = createInfoGoal();
    infoView.content.addChild(panel, page, closeButton);

    const showPopup = infoView.show.bind(infoView);
    infoView.show = (callback) => {
        void ready.then(() => {
            if (infoView.destroyed) return;
            place();
            showPopup(callback);
        });
    };

    app.renderer.on("resize", place);
    infoView.on("destroyed", () => {
        app.renderer.off("resize", place);
    });
    infoView.setLayout("landscape");

    return infoView;
}
