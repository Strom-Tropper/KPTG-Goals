import { Assets } from "pixi.js";
import { PreloadAssets } from "@/modules/game/engine/game.assets";
import createApp from "@/app/create-app";
import { GameScene } from "@/scenes/GameScene";
import { SceneManager } from "@/scenes/SceneManager";
import { WebSocketConnect } from "@/modules/game/ws/game.ws";
import { InitGameHandlers } from "@/modules/game/handlers/game.handlers";
import {
    EVENT_NAMES,
    eventBus,
    GOAL_EVENT_NAMES,
    goalEvents,
} from "@/modules/game/engine/game.events";
import { i18n } from "@/shared/i18n/I18nManager";
import { LoadingView } from "@/components/LoadingView";

const isMobile = window.matchMedia(
    "(hover: none) and (pointer: coarse)",
).matches;

// prettier-ignore
const ASSETPACK_MANIFEST_JSON = /*__ASSETPACK_MANIFEST__*/ '__LOAD_FROM_FILE__';

async function resolveAssetpackManifest() {
    if (ASSETPACK_MANIFEST_JSON !== "__LOAD_FROM_FILE__") {
        return JSON.parse(ASSETPACK_MANIFEST_JSON);
    }

    const response = await fetch("/manifest.json", { cache: "no-store" });
    if (!response.ok) return { bundles: [] };

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) return { bundles: [] };

    return response.json();
}

function waitForTokenResult(url: string, token: string): Promise<void> {
    return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            stopLoad();
            stopError();
            stopScreen();
            stopGoalError();
            resolve();
        };
        const stopLoad = eventBus.on(EVENT_NAMES.INITIAL_LOAD_RESPONSE, finish);
        const stopError = eventBus.on(EVENT_NAMES.ERROR_OCCURRED, finish);
        const stopScreen = goalEvents.on(GOAL_EVENT_NAMES.SCREEN, finish);
        const stopGoalError = goalEvents.on(GOAL_EVENT_NAMES.ERROR, finish);
        void WebSocketConnect(url, token).catch(finish);
    });
}

void (async () => {
    const assetpackManifest = await resolveAssetpackManifest();

    // init app
    const app = await createApp(() => {});

    const urlParams = new URLSearchParams(window.location.search);
    const defaultLang = import.meta.env.VITE_DEFAULT_LANG || "en";
    const initialLanguage = (
        urlParams.get("lang") || defaultLang
    ).toLowerCase();
    i18n.init(initialLanguage);

    const loading = new LoadingView(app.ticker);
    const placeLoading = () => {
        loading.resize(app.screen.width, app.screen.height);
    };
    app.stage.addChild(loading);
    placeLoading();
    app.renderer.on("resize", placeLoading);
    loading.setProgress(0.15);
    loading.setProgress(0.4);

    await Assets.init({
        manifest: assetpackManifest,
        loadOptions: {
            strategy: "retry",
            retryCount: 2,
            retryDelay: 1000,
        },
        texturePreference: {
            resolution: isMobile ? 0.6 : 1,
            format: ["avif", "png"],
        },
    });

    loading.setProgress(0.7);

    const audioUrls = await PreloadAssets();
    const token = urlParams.get("token") || import.meta.env.VITE_WS_TOKEN || "";
    const wsUrl = import.meta.env.VITE_WS_URL || "";
    InitGameHandlers();
    const tokenReady = waitForTokenResult(wsUrl, token);
    const gameScene = new GameScene(app, token, initialLanguage, audioUrls);
    new SceneManager(app, gameScene);
    app.stage.addChild(loading);
    await Promise.all([gameScene.ready, tokenReady]);
    loading.setProgress(1);
    await loading.completeProgress();
    app.renderer.off("resize", placeLoading);
    loading.destroy();
})();
