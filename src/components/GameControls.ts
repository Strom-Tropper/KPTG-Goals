import { Container, Graphics, NineSliceSprite, Rectangle, Sprite, Text, Texture } from "pixi.js";
import {
    GOAL_FRAME,
    GOAL_INK,
    GOAL_INK_MUTED,
    GOAL_KNOB,
    GOAL_MENU,
    GOAL_MENU_ROW,
    GOAL_READOUT,
    GOAL_READOUT_EDGE,
} from "@/shared/constants/goal";
import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";

export function goalLabel(
    value: string,
    x: number,
    y: number,
    fontSize: number,
    fill: number = GOAL_INK,
): Text {
    const text = createText({
        text: value,
        fontFamily: FONT_FAMILY.EB_GARAMOND,
        fontSize,
        fill,
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

function stackedLines(
    lines: string[],
    width: number,
    height: number,
    fill: number = GOAL_INK,
): Container {
    const block = new Container();
    const fontSize = Math.max(13, Math.round(height * (lines.length > 1 ? 0.28 : 0.34)));
    lines.forEach((line, index) => {
        const text = goalLabel(line, width / 2, 0, fontSize, fill);
        const spread = lines.length === 1 ? 0 : fontSize * 1.2;
        const offset = (index - (lines.length - 1) / 2) * spread;
        text.position.set(width / 2, height / 2 + offset);
        block.addChild(text);
    });
    return block;
}

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

    root.addChild(
        stackedLines(
            lines,
            width,
            height,
            enabled && !dim ? GOAL_INK : GOAL_INK_MUTED,
        ),
    );

    root.hitArea = new Rectangle(0, 0, width, height);
    root.eventMode = enabled ? "static" : "none";
    root.cursor = enabled ? "pointer" : "default";
    root.alpha = dim ? 0.4 : 1;
    if (enabled) root.on("pointertap", onPress);
    return root;
}

export function valueReadout(
    x: number,
    y: number,
    width: number,
    height: number,
    lines: string[],
    onPress?: () => void,
    muted = false,
    face?: ButtonSkin,
): Container {
    const root = new Container();
    root.position.set(x, y);
    if (face) {
        const plate = buttonSprite(buttonRest(face, Boolean(onPress)), width, height);
        root.addChild(plate);
        watchButtonSkin(root, plate, face, Boolean(onPress));
    } else {
        const radius = Math.max(8, Math.round(height * 0.22));
        const plate = new Graphics();
        plate
            .roundRect(0, 0, width, height, radius)
            .fill({ color: GOAL_READOUT })
            .stroke({ color: GOAL_READOUT_EDGE, width: 1 });
        root.addChild(plate);
    }
    root.addChild(
        stackedLines(lines, width, height, muted ? GOAL_INK_MUTED : GOAL_INK),
    );
    root.hitArea = new Rectangle(0, 0, width, height);
    root.eventMode = onPress ? "static" : "none";
    root.cursor = onPress ? "pointer" : "default";
    if (onPress) root.on("pointertap", onPress);
    return root;
}

const BALANCE_GREEN = 0x86a46c;
const BALANCE_GRAY = 0xd4d4d4;
const BALANCE_INK = 0x111111;

export function balanceReadout(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    amount: string | null,
): Container {
    const root = new Container();
    root.position.set(x, y);
    const shell = new Graphics();
    shell.roundRect(0, 0, width, height, Math.max(10, Math.round(height * 0.34))).fill({
        color: BALANCE_GREEN,
    });
    root.addChild(shell);

    const pad = Math.max(4, Math.round(height * 0.08));
    const header = Math.round(height * 0.4);
    const wellX = pad;
    const wellY = header;
    const wellW = Math.max(1, width - pad * 2);
    const wellH = Math.max(1, height - header - pad);
    const well = new Graphics();
    well
        .roundRect(wellX, wellY, wellW, wellH, Math.max(8, Math.round(wellH * 0.42)))
        .fill({ color: BALANCE_GRAY });
    root.addChild(well);

    const titleSize = Math.max(11, Math.round(header * 0.55));
    root.addChild(goalLabel(title, width / 2, header / 2, titleSize, BALANCE_INK));
    if (!amount) return root;

    const amountSize = Math.max(12, Math.round(wellH * 0.46));
    const amountLabel = goalLabel(
        amount,
        wellX + wellW / 2,
        wellY + wellH / 2,
        amountSize,
        BALANCE_INK,
    );
    const limit = wellW * 0.88;
    if (amountLabel.width > limit) amountLabel.scale.set(limit / amountLabel.width);
    root.addChild(amountLabel);
    return root;
}

export function betMenu(
    x: number,
    y: number,
    width: number,
    rowH: number,
    choices: { text: string; selected: boolean }[],
    onChoose: (index: number) => void,
): Container {
    const root = new Container();
    root.position.set(x, y);
    const pad = 8;
    const height = pad * 2 + rowH * choices.length;
    const plate = new Graphics();
    plate
        .roundRect(0, 0, width, height, 12)
        .fill({ color: GOAL_MENU })
        .stroke({ color: GOAL_FRAME, width: 2 });
    root.addChild(plate);

    choices.forEach((choice, index) => {
        const rowY = pad + index * rowH;
        const inset = 6;
        const row = new Graphics();
        row.roundRect(inset, rowY + 3, width - inset * 2, rowH - 6, 8).fill({
            color: choice.selected ? GOAL_KNOB : GOAL_MENU_ROW,
        });
        root.addChild(row);
        root.addChild(
            goalLabel(
                choice.text,
                width / 2,
                rowY + rowH / 2,
                Math.max(13, Math.round(rowH * 0.38)),
                choice.selected ? GOAL_INK : GOAL_INK_MUTED,
            ),
        );
        const hit = new Container();
        hit.position.set(0, rowY);
        hit.hitArea = new Rectangle(0, 0, width, rowH);
        hit.eventMode = "static";
        hit.cursor = "pointer";
        hit.on("pointertap", () => onChoose(index));
        root.addChild(hit);
    });

    return root;
}

export function betStepper(
    x: number,
    y: number,
    width: number,
    buttonH: number,
    lines: string[],
    minusEnabled: boolean,
    plusEnabled: boolean,
    onBet: (direction: -1 | 1) => void,
    onOpen: (() => void) | null,
    art: { button: ButtonSkin; minus: ButtonSkin; plus: ButtonSkin },
    metrics: { knob: number; gap: number },
): Container {
    const root = new Container();
    root.position.set(x, y);
    const { knob, gap } = metrics;
    const valueW = Math.max(1, width - knob * 2 - gap * 2);

    root.addChild(
        knobButton(
            0,
            (buttonH - knob) / 2,
            knob,
            art.minus,
            minusEnabled,
            () => onBet(-1),
        ),
    );
    root.addChild(
        valueReadout(
            knob + gap,
            0,
            valueW,
            buttonH,
            lines,
            onOpen ?? undefined,
            onOpen === null,
            art.button,
        ),
    );
    root.addChild(
        knobButton(
            width - knob,
            (buttonH - knob) / 2,
            knob,
            art.plus,
            plusEnabled,
            () => onBet(1),
        ),
    );
    return root;
}

export function circleButton(
    x: number,
    y: number,
    width: number,
    height: number,
    skin: ButtonSkin,
    enabled = true,
    onPress?: () => void,
): Container {
    const root = new Container();
    const sprite = new Sprite(enabled ? skin.active : skin.normal);
    sprite.anchor.set(0.5);
    sprite.width = width;
    sprite.height = height;
    root.addChild(sprite);
    root.position.set(x, y);
    root.hitArea = new Rectangle(-width / 2, -height / 2, width, height);
    root.eventMode = enabled ? "static" : "none";
    root.cursor = enabled ? "pointer" : "default";
    watchButtonSkin(root, sprite, skin, enabled);
    if (enabled && onPress) root.on("pointertap", onPress);
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
