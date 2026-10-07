import { Container, Graphics, Ticker } from "pixi.js";

export type CreateSpinnerOptions = {
    canvas?: HTMLCanvasElement;
    color?: number;
    dotCount?: number;
    dotRadius?: number;
    radius?: number;
    speed?: number;
    ticker?: Ticker;
    visible?: boolean;
    x?: number;
    y?: number;
};

export type Spinner = Container & {
    hide: () => void;
    setRunning: (running: boolean) => void;
    show: () => void;
};

const DEFAULT_COLOR = 0xffffff;
const DEFAULT_DOT_COUNT = 12;
const DEFAULT_DOT_RADIUS = 6;
const DEFAULT_RADIUS = 44;
const DEFAULT_SPEED = 0.12;

function createSpinnerDots(
    options: Required<
        Pick<
            CreateSpinnerOptions,
            "color" | "dotCount" | "dotRadius" | "radius"
        >
    >,
) {
    const dots = new Container();

    for (let i = 0; i < options.dotCount; i += 1) {
        const progress = i / options.dotCount;
        const angle = progress * Math.PI * 2;
        const dot = new Graphics().circle(0, 0, options.dotRadius).fill({
            alpha: 0.2 + progress * 0.8,
            color: options.color,
        });

        dot.position.set(
            Math.cos(angle) * options.radius,
            Math.sin(angle) * options.radius,
        );
        dots.addChild(dot);
    }

    return dots;
}

export function createSpinner(options: CreateSpinnerOptions = {}): Spinner {
    const spinner = new Container() as Spinner;
    const ticker = options.ticker ?? Ticker.shared;
    const aspectRatioCorrection = new Container();
    const dots = createSpinnerDots({
        color: options.color ?? DEFAULT_COLOR,
        dotCount: options.dotCount ?? DEFAULT_DOT_COUNT,
        dotRadius: options.dotRadius ?? DEFAULT_DOT_RADIUS,
        radius: options.radius ?? DEFAULT_RADIUS,
    });
    let isRunning = false;

    const preserveAspectRatio = () => {
        const canvas = options.canvas;
        if (!canvas) return;

        const bounds = canvas.getBoundingClientRect();
        const scaleX = bounds.width / canvas.offsetWidth;
        const scaleY = bounds.height / canvas.offsetHeight;

        if (scaleX <= 0 || scaleY <= 0) return;

        const uniformScale = Math.min(scaleX, scaleY);
        aspectRatioCorrection.scale.set(
            uniformScale / scaleX,
            uniformScale / scaleY,
        );
    };

    const update = () => {
        dots.rotation += options.speed ?? DEFAULT_SPEED;
    };

    aspectRatioCorrection.addChild(dots);
    spinner.addChild(aspectRatioCorrection);
    spinner.position.set(options.x ?? 0, options.y ?? 0);
    spinner.visible = options.visible ?? true;
    preserveAspectRatio();

    const resizeObserver = options.canvas
        ? new ResizeObserver(preserveAspectRatio)
        : undefined;
    if (options.canvas) {
        resizeObserver?.observe(options.canvas);
    }
    window.addEventListener("resize", preserveAspectRatio);
    window.addEventListener("orientationchange", preserveAspectRatio);
    window.visualViewport?.addEventListener("resize", preserveAspectRatio);

    spinner.setRunning = (running: boolean) => {
        if (isRunning === running) return;

        isRunning = running;
        if (running) {
            ticker.add(update);
            return;
        }

        ticker.remove(update);
    };

    spinner.show = () => {
        spinner.visible = true;
        spinner.setRunning(true);
    };

    spinner.hide = () => {
        spinner.visible = false;
        spinner.setRunning(false);
    };

    const destroy = spinner.destroy.bind(spinner);
    spinner.destroy = (
        options: Parameters<Container["destroy"]>[0] = { children: true },
    ) => {
        spinner.setRunning(false);
        resizeObserver?.disconnect();
        window.removeEventListener("resize", preserveAspectRatio);
        window.removeEventListener("orientationchange", preserveAspectRatio);
        window.visualViewport?.removeEventListener(
            "resize",
            preserveAspectRatio,
        );
        destroy(options);
    };

    spinner.setRunning(spinner.visible);

    return spinner;
}
