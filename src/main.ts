import { Assets } from "pixi.js";
import { PreloadAssets } from "@/modules/game/engine/game.assets";
import createApp from "@/app/create-app";
import { GameScene } from "@/scenes/GameScene";
import { SceneManager } from "@/scenes/SceneManager";
import { WebSocketConnect } from "@/modules/game/ws/game.ws";
import { InitGameHandlers } from "@/modules/game/handlers/game.handlers";
import { i18n } from "@/shared/i18n/I18nManager";
import { createSpinner } from "@/components/base/Spinner";

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

void (async () => {
    const assetpackManifest = await resolveAssetpackManifest();

    // init app
    const app = await createApp(() => {});

    // init spinner
    const spinner = createSpinner({
        canvas: app.canvas,
        ticker: app.ticker,
        x: app.screen.width / 2,
        y: app.screen.height / 2,
    });
    app.stage.addChild(spinner);

    // init params and i18n
    const urlParams = new URLSearchParams(window.location.search);

    const defaultLang = import.meta.env.VITE_DEFAULT_LANG || "en";
    const initialLanguage = (
        urlParams.get("lang") || defaultLang
    ).toLowerCase();
    i18n.init(initialLanguage);

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

    spinner.destroy();

    const audioUrls = await PreloadAssets();
    const token = urlParams.get("token") || "";
    const gameScene = new GameScene(app, token, initialLanguage, audioUrls);
    new SceneManager(app, gameScene);

    InitGameHandlers();

    const wsUrl = import.meta.env.VITE_WS_URL || "";
    try {
        await WebSocketConnect(wsUrl, token);
    } catch {
        // Reconnect keeps running inside the socket module.
    }
})();
