import { Container, NineSliceSprite, Rectangle, Sprite, Text, Texture } from "pixi.js";
import { GOAL_INK } from "@/shared/constants/goal";
import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";

export function goalLabel(
    value: string,
    x: number,
    y: number,
    fontSize: number,
): Text {
    const text = createText({
        text: value,
        fontFamily: FONT_FAMILY.EB_GARAMOND,
        fontSize,
        fill: GOAL_INK,
        align: "center",
    });
    text.anchor.set(0.5);
    text.position.set(x, y);
    return text;
}

export type ButtonSkin = {
    active: Texture;
    hover: Texture;
    normal: Texture;
};

export function labeledButton(
    x: number,
    y: number,
    width: number,
    height: number,
    lines: string[],
    enabled: boolean,
    onPress: () => void,
    dim = false,
    face?: ButtonSkin,
): Container {
    const root = new Container();
    root.position.set(x, y);
    const plate = face
        ? buttonSprite(buttonRest(face, enabled && !dim), width, height)
        : null;
    if (plate) {
        root.addChild(plate);
        watchButtonSkin(root, plate, face, !dim && enabled);
    }

    const fontSize = Math.max(13, Math.round(height * (lines.length > 1 ? 0.28 : 0.34)));
    lines.forEach((line, index) => {
        const text = goalLabel(line, width / 2, 0, fontSize);
        const spread = lines.length === 1 ? 0 : fontSize * 1.2;
        const offset = (index - (lines.length - 1) / 2) * spread;
        text.position.set(width / 2, height / 2 + offset);
        root.addChild(text);
    });

    root.hitArea = new Rectangle(0, 0, width, height);
    root.eventMode = enabled ? "static" : "none";
    root.cursor = enabled ? "pointer" : "default";
    root.alpha = dim ? 0.4 : 1;
    if (enabled) root.on("pointertap", onPress);
    return root;
}

export function betStepper(
    x: number,
    y: number,
    width: number,
    buttonH: number,
    captionH: number,
    caption: string,
    value: string,
    enabled: boolean,
    onBet: (direction: -1 | 1) => void,
    art: { button: ButtonSkin; minus: ButtonSkin; plus: ButtonSkin },
): Container {
    const root = new Container();
    root.position.set(x, y);
    root.addChild(
        goalLabel(
            caption,
            width / 2,
            captionH / 2,
            Math.max(12, Math.round(captionH * 0.72)),
        ),
    );

    const knob = buttonH * 0.72;
    const gap = Math.round(buttonH * 0.16);
    const valueW = width - knob * 2 - gap * 2;
    const rowY = captionH;

    root.addChild(
        knobButton(
            0,
            rowY + (buttonH - knob) / 2,
            knob,
            art.minus,
            enabled,
            () => onBet(-1),
        ),
    );
    root.addChild(
        labeledButton(
            knob + gap,
            rowY,
            valueW,
            buttonH,
            [value],
            false,
            () => undefined,
            false,
            art.button,
        ),
    );
    root.addChild(
        knobButton(
            width - knob,
            rowY + (buttonH - knob) / 2,
            knob,
            art.plus,
            enabled,
            () => onBet(1),
        ),
    );
    return root;
}

export function circleButton(
    x: number,
    y: number,
    diameter: number,
    skin: ButtonSkin,
): Container {
    const root = new Container();
    const sprite = new Sprite(skin.active);
    sprite.anchor.set(0.5);
    sprite.width = diameter;
    sprite.height = diameter;
    root.addChild(sprite);
    root.position.set(x, y);
    root.hitArea = new Rectangle(
        -diameter / 2,
        -diameter / 2,
        diameter,
        diameter,
    );
    root.eventMode = "static";
    root.cursor = "pointer";
    watchButtonSkin(root, sprite, skin, true);
    return root;
}

function knobButton(
    x: number,
    y: number,
    size: number,
    skin: ButtonSkin,
    enabled: boolean,
    onPress: () => void,
): Container {
    const root = new Container();
    root.position.set(x, y);
    const face = new Sprite(buttonRest(skin, enabled));
    face.width = size;
    face.height = size;
    root.addChild(face);
    root.hitArea = new Rectangle(0, 0, size, size);
    root.eventMode = enabled ? "static" : "none";
    root.cursor = enabled ? "pointer" : "default";
    watchButtonSkin(root, face, skin, enabled);
    if (enabled) root.on("pointertap", onPress);
    return root;
}

function buttonRest(skin: ButtonSkin, enabled: boolean): Texture {
    return enabled ? skin.active : skin.normal;
}

function buttonSprite(
    texture: Texture,
    width: number,
    height: number,
): NineSliceSprite {
    const slice = Math.max(8, Math.round(texture.height * 0.22));
    return new NineSliceSprite({
        texture,
        leftWidth: slice,
        topHeight: slice,
        rightWidth: slice,
        bottomHeight: slice,
        width,
        height,
    });
}

function watchButtonSkin(
    root: Container,
    plate: Sprite | NineSliceSprite,
    skin: ButtonSkin | undefined,
    enabled: boolean,
): void {
    if (!skin || !enabled) return;

    root.on("pointerover", () => {
        plate.texture = skin.hover;
    });
    root.on("pointerout", () => {
        plate.texture = skin.active;
    });
    root.on("pointerdown", () => {
        plate.texture = skin.hover;
    });
    root.on("pointerup", () => {
        plate.texture = skin.hover;
    });
    root.on("pointerupoutside", () => {
        plate.texture = skin.active;
    });
}
