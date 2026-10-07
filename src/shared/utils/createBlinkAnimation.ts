import { Container, Ticker } from "pixi.js";

type BlinkAnimationOptions = {
    target: Container;
    ticker: Ticker;
    cycleMs?: number;
    scalePulse?: number;
    minAlpha?: number;
};

export type BlinkAnimation = {
    setBaseScale: (scale: number) => void;
    start: () => void;
    stop: () => void;
};

const DEFAULT_CYCLE_MS = 450;
const DEFAULT_SCALE_PULSE = 0.04;
const DEFAULT_MIN_ALPHA = 0.35;

export function createBlinkAnimation({
    target,
    ticker,
    cycleMs = DEFAULT_CYCLE_MS,
    scalePulse = DEFAULT_SCALE_PULSE,
    minAlpha = DEFAULT_MIN_ALPHA,
}: BlinkAnimationOptions): BlinkAnimation {
    let baseScale = target.scale.x || 1;
    let isAnimating = false;
    let startTime = 0;

    const tick = () => {
        if (!isAnimating) return;

        const elapsed = Date.now() - startTime;
        const progress = (elapsed % cycleMs) / cycleMs;
        const pulse = (Math.cos(progress * Math.PI * 2) + 1) / 2;
        const blinkAlpha = minAlpha + pulse * (1 - minAlpha);
        const blinkScale = baseScale * (1 + pulse * scalePulse);

        target.alpha = blinkAlpha;
        target.scale.set(blinkScale);
    };

    const stop = () => {
        isAnimating = false;
        ticker.remove(tick);
        target.alpha = 1;
        target.scale.set(baseScale);
    };

    return {
        setBaseScale: (scale: number) => {
            baseScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
            if (!isAnimating) {
                target.scale.set(baseScale);
            }
        },
        start: () => {
            stop();
            isAnimating = true;
            startTime = Date.now();
            ticker.add(tick);
        },
        stop,
    };
}
