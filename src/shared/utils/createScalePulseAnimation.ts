import type { Container, Ticker } from "pixi.js";

type ScalePulseAnimationOptions = Partial<{
    durationMs: number;
    scale: number;
}>;

export type ScalePulseAnimation = {
    play: () => void;
    stop: () => void;
};

const DEFAULT_DURATION_MS = 160;
const DEFAULT_SCALE = 1.14;

export function createScalePulseAnimation(
    ticker: Ticker,
    target: Container,
    options: ScalePulseAnimationOptions = {},
): ScalePulseAnimation {
    const durationMs = options.durationMs ?? DEFAULT_DURATION_MS;
    const targetScale = options.scale ?? DEFAULT_SCALE;
    let listener: ((ticker: Ticker) => void) | undefined;
    let baseScaleX = target.scale.x;
    let baseScaleY = target.scale.y;

    const stop = () => {
        if (!listener) return;

        ticker.remove(listener);
        listener = undefined;
        target.scale.set(baseScaleX, baseScaleY);
    };

    const play = () => {
        stop();

        baseScaleX = target.scale.x;
        baseScaleY = target.scale.y;
        let elapsedMs = 0;

        listener = (currentTicker) => {
            elapsedMs += currentTicker.elapsedMS;
            const progress = Math.min(elapsedMs / durationMs, 1);
            const pulse = 1 + (targetScale - 1) * Math.sin(progress * Math.PI);

            target.scale.set(baseScaleX * pulse, baseScaleY * pulse);

            if (progress >= 1) {
                stop();
            }
        };

        ticker.add(listener);
    };

    return { play, stop };
}
