import { Application } from "pixi.js";

function disableBrowserTouchSelection(element: HTMLElement) {
    element.style.setProperty("-webkit-tap-highlight-color", "transparent");
}

const isMobile = window.matchMedia(
    "(hover: none) and (pointer: coarse)",
).matches;

const MOBILE_RESOLUTION_MULTIPLIER = 1;
const DESKTOP_RESOLUTION_MULTIPLIER = 1;
const RESIZE_DEBOUNCE_MS = 500;

function getResolution() {
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const resolutionMultiplier = isMobile
        ? MOBILE_RESOLUTION_MULTIPLIER
        : DESKTOP_RESOLUTION_MULTIPLIER;

    return devicePixelRatio * resolutionMultiplier;
}

export default async function createApp(callback: () => void) {
    const initialResolution = getResolution();

    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        autoStart: true,
        sharedTicker: true,
        backgroundAlpha: 0,
        antialias: true,
        preference: "webgl",
        gcActive: true,
        gcMaxUnusedTime: isMobile ? 30_000 : 60_000,
        resolution: initialResolution,
    });

    // Append the application canvas to the document body
    const gameId = import.meta.env.VITE_GAME_ID ?? "app";
    const gameContainer = document.getElementById(gameId);

    if (gameContainer) {
        gameContainer.appendChild(app.canvas);
    } else {
        throw new Error(`Game container not found. Tried id: "${gameId}".`);
    }

    const container = gameContainer;

    // Spine, AnimatedSprite, SpinTable, and Application rendering now share
    // one Pixi ticker. Keep restart control with the Application lifecycle.
    app.ticker.autoStart = false;
    app.ticker.maxFPS = 60;

    container.style.position ||= "relative";
    container.style.overflow = "hidden";
    container.style.width ||= "100vw";
    container.style.height ||= CSS.supports("height", "100dvh")
        ? "100dvh"
        : "100vh";

    disableBrowserTouchSelection(document.documentElement);
    disableBrowserTouchSelection(document.body);
    disableBrowserTouchSelection(container);
    app.canvas.style.display = "block";
    app.canvas.style.position = "absolute";
    app.canvas.style.transformOrigin = "top left";
    disableBrowserTouchSelection(app.canvas);

    function resizeCanvas() {
        const containerWidth = container.clientWidth || window.innerWidth;
        const containerHeight = container.clientHeight || window.innerHeight;

        app.renderer.resize(containerWidth, containerHeight);

        app.canvas.style.width = `${containerWidth}px`;
        app.canvas.style.height = `${containerHeight}px`;

        app.canvas.style.left = "0";
        app.canvas.style.top = "0";
        app.canvas.style.transform = "none";
    }

    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;

    function updateResolution() {
        const containerWidth = container.clientWidth || window.innerWidth;
        const containerHeight = container.clientHeight || window.innerHeight;
        const resolution = getResolution();

        app.renderer.resize(containerWidth, containerHeight, resolution);
    }

    function handleResize() {
        resizeCanvas();
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateResolution, RESIZE_DEBOUNCE_MS);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    resizeCanvas();

    callback();

    return app;
}
