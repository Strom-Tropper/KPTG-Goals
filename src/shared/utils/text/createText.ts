import {
    HTMLText,
    Text,
    type HTMLTextStyleOptions,
    type TextStyleOptions,
} from "pixi.js";

export const FONT_FAMILY = {
    BARLOW_CONDENSED: "BarlowCondensed-Regular",
    CORMORANT_GARAMOND_BOLD: "CormorantGaramond-Bold",
    EB_GARAMOND: "EB Garamond",
    EB_GARAMOND_VARIABLE: "EB Garamond",
    KANIT_MEDIUM: "Kanit-Medium",
} as const;

type FontFamily = (typeof FONT_FAMILY)[keyof typeof FONT_FAMILY];

export type CreateTextOptions = {
    fontFamily: FontFamily;
    fontSize: number;

    text?: string;
    align?: "left" | "center" | "right";
    fill?: TextStyleOptions["fill"];
    lineHeight?: number;
    wordWrap?: boolean;
    wordWrapWidth?: number;
    letterSpacing?: number;
    fontWeight?: TextStyleOptions["fontWeight"];

    dropShadow?: TextStyleOptions["dropShadow"];
    stroke?: TextStyleOptions["stroke"];
    tagStyles?: TextStyleOptions["tagStyles"];
};

type CreateHTMLTextOptions = Omit<CreateTextOptions, "tagStyles"> & {
    html: true;
    tagStyles?: HTMLTextStyleOptions["tagStyles"];
};

export function createText(options: CreateHTMLTextOptions): HTMLText;
export function createText(options: CreateTextOptions): Text;
export function createText({
    fontFamily,
    align = "center",
    dropShadow,
    fill = "#fff",
    fontSize,
    fontWeight,
    letterSpacing = 0,
    text = "",
    stroke,
    lineHeight,
    wordWrap,
    wordWrapWidth,
    html = false,
    tagStyles,
}: Omit<CreateTextOptions, "tagStyles"> & {
    html?: boolean;
    tagStyles?:
        | TextStyleOptions["tagStyles"]
        | HTMLTextStyleOptions["tagStyles"];
}) {
    const style: TextStyleOptions = {
        align,
        dropShadow,
        fill,
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight,
        wordWrap,
        wordWrapWidth,
    };

    // Undefined values override Pixi's defaults and can produce an invalid canvas font.
    for (const key of Object.keys(style) as Array<keyof TextStyleOptions>) {
        if (style[key] === undefined) {
            delete style[key];
        }
    }

    if (stroke) {
        style.stroke = stroke;
    }

    if (html) {
        return new HTMLText({
            text,
            style: {
                ...style,
                tagStyles: tagStyles as HTMLTextStyleOptions["tagStyles"],
            },
        });
    }

    style.tagStyles = tagStyles as TextStyleOptions["tagStyles"];
    return new Text({ text, style });
}
