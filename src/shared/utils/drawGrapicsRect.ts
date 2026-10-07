import { Bounds } from "../types/common";

type RectFillTarget = {
    clear: () => unknown;
    fill: (style: { alpha: number; color: number }) => unknown;
    rect: (
        x: number,
        y: number,
        width: number,
        height: number,
    ) => RectFillTarget;
};

export function drawGraphicsRect(
    target: RectFillTarget,
    bounds: Pick<Bounds, "height" | "left" | "top" | "width">,
    color: number,
    alpha = 1,
) {
    const width = Math.max(0, bounds.width);
    const height = Math.max(0, bounds.height);

    target.clear();
    target.rect(bounds.left, bounds.top, width, height).fill({
        alpha,
        color,
    });
}
