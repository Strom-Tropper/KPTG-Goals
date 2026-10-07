import { BitmapText, type TextStyleOptions } from "pixi.js";

const JACKPOT_FONT_FAMILY = "Btmapfont_Jackpot";
const WIN_AMOUNT_FONT_FAMILY = "Win Amount Font";
const MAIN_GAME_AMOUNT_FONT_FAMILY = "MainGameAmount";
const SLICE_WIN_AMOUNT_FONT_FAMILY = "SliceWinAmount";
const SLICE_WIN_AMOUNT_FONT_SIZE = 60;

type BitmapTextOptions = {
    fontFamily?: string;
    fontSize: number;
    text?: string;
    align?: "left" | "center" | "right";
    fill?: string;
    stroke?: {
        color: string;
        width: number;
    };
};

type MainGameAmountBitmapTextOptions = {
    fontSize: number;
    text?: string;
    fill: string;
    letterSpacing?: number;
};

export function createJackpotBitmapText({
    align = "center",
    fill = "#fff",
    fontFamily = JACKPOT_FONT_FAMILY,
    fontSize,
    text = "",
    stroke,
}: BitmapTextOptions) {
    const style: TextStyleOptions = {
        align,
        fill,
        fontFamily,
        fontSize,
    };

    if (stroke) {
        style.stroke = stroke;
    }

    return new BitmapText({ text, style });
}

export function createWinAmountBitmapText(options: BitmapTextOptions) {
    return createJackpotBitmapText({
        ...options,
        fontFamily: WIN_AMOUNT_FONT_FAMILY,
    });
}

export function createMainGameAmountBitmapText({
    fill,
    fontSize,
    letterSpacing = 0,
    text = "0",
}: MainGameAmountBitmapTextOptions): BitmapText {
    return new BitmapText({
        text,
        style: {
            align: "center",
            fill,
            fontFamily: MAIN_GAME_AMOUNT_FONT_FAMILY,
            fontSize,
            letterSpacing,
        },
    });
}

export function createSliceWinAmountBitmapText(): BitmapText {
    return new BitmapText({
        text: "+0",
        style: {
            align: "center",
            fill: "#ffffff",
            fontFamily: SLICE_WIN_AMOUNT_FONT_FAMILY,
            fontSize: SLICE_WIN_AMOUNT_FONT_SIZE,
            letterSpacing: 1.44,
        },
    });
}
