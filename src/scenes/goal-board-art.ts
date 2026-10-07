import { Assets, Texture } from "pixi.js";
import cellActiveUrl from "../../raw-assets/board{m}{copy}/cell-active.svg";
import cellExplodeUrl from "../../raw-assets/board{m}{copy}/cell-explode.svg";
import cellNormalUrl from "../../raw-assets/board{m}{copy}/cell-normal.svg";
import markBallUrl from "../../raw-assets/board{m}{copy}/mark-ball.svg";
import markBombUrl from "../../raw-assets/board{m}{copy}/mark-bomb.svg";
import markBulletUrl from "../../raw-assets/board{m}{copy}/mark-bullet.svg";
import markExplodeUrl from "../../raw-assets/board{m}{copy}/mark-explode.svg";
import buttonFaceActiveUrl from "../../raw-assets/board{m}{copy}/button-face-active.svg";
import buttonFaceHoverUrl from "../../raw-assets/board{m}{copy}/button-face-hover.svg";
import buttonFaceUrl from "../../raw-assets/board{m}{copy}/button-face.svg";
import buttonInfoActiveUrl from "../../raw-assets/board{m}{copy}/button-info-active.svg";
import buttonInfoHoverUrl from "../../raw-assets/board{m}{copy}/button-info-hover.svg";
import buttonInfoUrl from "../../raw-assets/board{m}{copy}/button-info.svg";
import buttonMinusActiveUrl from "../../raw-assets/board{m}{copy}/button-minus-active.svg";
import buttonMinusHoverUrl from "../../raw-assets/board{m}{copy}/button-minus-hover.svg";
import buttonMinusUrl from "../../raw-assets/board{m}{copy}/button-minus.svg";
import buttonPlusActiveUrl from "../../raw-assets/board{m}{copy}/button-plus-active.svg";
import buttonPlusHoverUrl from "../../raw-assets/board{m}{copy}/button-plus-hover.svg";
import buttonPlusUrl from "../../raw-assets/board{m}{copy}/button-plus.svg";
import buttonSoundActiveUrl from "../../raw-assets/board{m}{copy}/button-sound-active.svg";
import buttonSoundHoverUrl from "../../raw-assets/board{m}{copy}/button-sound-hover.svg";
import buttonSoundUrl from "../../raw-assets/board{m}{copy}/button-sound.svg";

import type { ButtonSkin } from "@/components/GoalControls";

export type { ButtonSkin };

export type GoalBoardArt = {
    ball: Texture;
    bomb: Texture;
    bullet: Texture;
    button: ButtonSkin;
    cellActive: Texture;
    cellExplode: Texture;
    cellNormal: Texture;
    explode: Texture;
    info: ButtonSkin;
    minus: ButtonSkin;
    plus: ButtonSkin;
    sound: ButtonSkin;
};

const ART_URLS = {
    ball: markBallUrl,
    bomb: markBombUrl,
    bullet: markBulletUrl,
    buttonActive: buttonFaceActiveUrl,
    buttonHover: buttonFaceHoverUrl,
    buttonNormal: buttonFaceUrl,
    cellActive: cellActiveUrl,
    cellExplode: cellExplodeUrl,
    cellNormal: cellNormalUrl,
    explode: markExplodeUrl,
    infoActive: buttonInfoActiveUrl,
    infoHover: buttonInfoHoverUrl,
    infoNormal: buttonInfoUrl,
    minusActive: buttonMinusActiveUrl,
    minusHover: buttonMinusHoverUrl,
    minusNormal: buttonMinusUrl,
    plusActive: buttonPlusActiveUrl,
    plusHover: buttonPlusHoverUrl,
    plusNormal: buttonPlusUrl,
    soundActive: buttonSoundActiveUrl,
    soundHover: buttonSoundHoverUrl,
    soundNormal: buttonSoundUrl,
} as const;

export async function loadGoalBoardArt(): Promise<GoalBoardArt> {
    const loaded = await Promise.all(
        Object.entries(ART_URLS).map(async ([name, url]) => {
            const texture = await Assets.load<Texture>({
                src: url,
                data: { resolution: 2 },
            });
            return [name, texture] as const;
        }),
    );
    const texture = Object.fromEntries(loaded) as Record<
        keyof typeof ART_URLS,
        Texture
    >;

    return {
        ball: texture.ball,
        bomb: texture.bomb,
        bullet: texture.bullet,
        button: skin(texture, "button"),
        cellActive: texture.cellActive,
        cellExplode: texture.cellExplode,
        cellNormal: texture.cellNormal,
        explode: texture.explode,
        info: skin(texture, "info"),
        minus: skin(texture, "minus"),
        plus: skin(texture, "plus"),
        sound: skin(texture, "sound"),
    };
}

function skin(
    texture: Record<string, Texture>,
    name: string,
): ButtonSkin {
    return {
        normal: texture[`${name}Normal`],
        hover: texture[`${name}Hover`],
        active: texture[`${name}Active`],
    };
}
