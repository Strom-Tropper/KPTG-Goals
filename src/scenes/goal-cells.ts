import { Container, Rectangle, Sprite, Texture } from "pixi.js";
import type { GoalCellFace } from "@/modules/game/engine/goal-types";
import type { GoalBoardArt } from "@/scenes/goal-board-art";

export function goalCell(
    art: GoalBoardArt,
    face: GoalCellFace,
    x: number,
    y: number,
    size: number,
    onPress?: () => void,
): Container {
    const root = new Container();
    root.position.set(x, y);
    const tile = new Sprite(tileTexture(art, face));
    tile.width = size;
    tile.height = size;
    root.addChild(tile);
    if (onPress) {
        root.eventMode = "static";
        root.cursor = "pointer";
        root.hitArea = new Rectangle(0, 0, size, size);
        root.on("pointertap", onPress);
    }

    const mark =
        face === "bomb"
            ? art.bomb
            : face === "ball"
              ? art.ball
              : face === "explode"
                ? art.explode
                : face === "bullet"
                  ? art.bullet
                  : null;
    if (mark) {
        const icon = new Sprite(mark);
        const iconSize = size * 0.62;
        icon.anchor.set(0.5);
        icon.width = iconSize;
        icon.height = iconSize;
        icon.position.set(size / 2, size / 2);
        root.addChild(icon);
    }

    return root;
}

function tileTexture(art: GoalBoardArt, face: GoalCellFace): Texture {
    if (face === "explode") return art.cellExplode;
    if (face === "active") return art.cellActive;
    return art.cellNormal;
}
