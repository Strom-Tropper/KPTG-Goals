import { Ticker } from "pixi.js";

type AnimateNumberOptions = {
    from: number;
    to: number;
    durationMs: number;
    frameMs?: number;
    ticker?: Ticker;
    onUpdate: (value: number) => void;
    onComplete?: () => void;
};

export type NumberAnimation = {
    stop: (complete?: boolean) => void;
};

export function animateNumber(options: AnimateNumberOptions): NumberAnimation {
    const {
        from,
        to,
        durationMs,
        frameMs = 0,
        ticker = Ticker.shared,
        onUpdate,
        onComplete,
    } = options;

    if (durationMs <= 0) {
        onUpdate(to);
        onComplete?.();
        return {
            stop: () => undefined,
        };
    }

    let elapsedMs = 0;
    let frameElapsedMs = frameMs;
    let isActive = true;

    const stop = (complete = false) => {
        if (!isActive) {
            return;
        }

        ticker.remove(update);
        isActive = false;

        if (complete) {
            onUpdate(to);
            onComplete?.();
        }
    };

    const update = (tickerUpdate: Ticker) => {
        elapsedMs += tickerUpdate.deltaMS;
        frameElapsedMs += tickerUpdate.deltaMS;

        const progress = Math.min(1, elapsedMs / durationMs);

        if (progress < 1 && frameElapsedMs < frameMs) {
            return;
        }

        frameElapsedMs = 0;
        onUpdate(from + (to - from) * progress);

        if (progress >= 1) {
            stop(true);
        }
    };

    ticker.add(update);

    return {
        stop,
    };
}
