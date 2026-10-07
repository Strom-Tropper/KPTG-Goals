import { createText, FONT_FAMILY } from "./text/createText";

export function createDotsSprite() {
    const dots = createText({
        fontSize: 50,
        text: "...",
        fontFamily: FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
    });
    dots.anchor.set(0.5);
    return dots;
}

export function getPaginationModel(total: number, current: number) {
    const safeTotal = Math.max(Number(total) || 1, 1);
    const safeCurrent = Math.min(Math.max(Number(current) || 1, 1), safeTotal);

    if (safeTotal <= 7) {
        return Array.from({ length: safeTotal }, (_, idx) => idx + 1);
    }

    if (safeCurrent <= 3) {
        return [1, 2, 3, 4, "...", safeTotal];
    }

    if (safeCurrent >= safeTotal - 2) {
        return [
            1,
            "...",
            safeTotal - 3,
            safeTotal - 2,
            safeTotal - 1,
            safeTotal,
        ];
    }

    return [
        1,
        "...",
        safeCurrent - 1,
        safeCurrent,
        safeCurrent + 1,
        "...",
        safeTotal,
    ];
}
