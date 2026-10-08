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
import buttonHistoryActiveUrl from "../../raw-assets/board{m}{copy}/button-history-active.svg";
import buttonHistoryHoverUrl from "../../raw-assets/board{m}{copy}/button-history-hover.svg";
import buttonHistoryUrl from "../../raw-assets/board{m}{copy}/button-history.svg";

import type { ButtonSkin } from "@/components/GoalControls";
import {
    goalAssets,
    type GoalAssetName,
} from "@/modules/game/engine/goal-assets";

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
    history: ButtonSkin;
    info: ButtonSkin;
    minus: ButtonSkin;
    plus: ButtonSkin;
    sound: ButtonSkin;
};

const ART_URLS = {
    [goalAssets.cell_normal]: cellNormalUrl,
    [goalAssets.cell_active]: cellActiveUrl,
    [goalAssets.cell_explode]: cellExplodeUrl,
    [goalAssets.mark_ball]: markBallUrl,
    [goalAssets.mark_bomb]: markBombUrl,
    [goalAssets.mark_bullet]: markBulletUrl,
    [goalAssets.mark_explode]: markExplodeUrl,
    [goalAssets.button_face]: buttonFaceUrl,
    [goalAssets.button_face_hover]: buttonFaceHoverUrl,
    [goalAssets.button_face_active]: buttonFaceActiveUrl,
    [goalAssets.button_plus]: buttonPlusUrl,
    [goalAssets.button_plus_hover]: buttonPlusHoverUrl,
    [goalAssets.button_plus_active]: buttonPlusActiveUrl,
    [goalAssets.button_minus]: buttonMinusUrl,
    [goalAssets.button_minus_hover]: buttonMinusHoverUrl,
    [goalAssets.button_minus_active]: buttonMinusActiveUrl,
    [goalAssets.button_info]: buttonInfoUrl,
    [goalAssets.button_info_hover]: buttonInfoHoverUrl,
    [goalAssets.button_info_active]: buttonInfoActiveUrl,
    [goalAssets.button_sound]: buttonSoundUrl,
    [goalAssets.button_sound_hover]: buttonSoundHoverUrl,
    [goalAssets.button_sound_active]: buttonSoundActiveUrl,
    [goalAssets.button_history]: buttonHistoryUrl,
    [goalAssets.button_history_hover]: buttonHistoryHoverUrl,
    [goalAssets.button_history_active]: buttonHistoryActiveUrl,
} satisfies Record<GoalAssetName, string>;

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
        ball: texture[goalAssets.mark_ball],
        bomb: texture[goalAssets.mark_bomb],
        bullet: texture[goalAssets.mark_bullet],
        button: skin(
            texture,
            goalAssets.button_face,
            goalAssets.button_face_hover,
            goalAssets.button_face_active,
        ),
        cellActive: texture[goalAssets.cell_active],
        cellExplode: texture[goalAssets.cell_explode],
        cellNormal: texture[goalAssets.cell_normal],
        explode: texture[goalAssets.mark_explode],
        history: skin(
            texture,
            goalAssets.button_history,
            goalAssets.button_history_hover,
            goalAssets.button_history_active,
        ),
        info: skin(
            texture,
            goalAssets.button_info,
            goalAssets.button_info_hover,
            goalAssets.button_info_active,
        ),
        minus: skin(
            texture,
            goalAssets.button_minus,
            goalAssets.button_minus_hover,
            goalAssets.button_minus_active,
        ),
        plus: skin(
            texture,
            goalAssets.button_plus,
            goalAssets.button_plus_hover,
            goalAssets.button_plus_active,
        ),
        sound: skin(
            texture,
            goalAssets.button_sound,
            goalAssets.button_sound_hover,
            goalAssets.button_sound_active,
        ),
    };
}

function skin(
    texture: Record<GoalAssetName, Texture>,
    normal: GoalAssetName,
    hover: GoalAssetName,
    active: GoalAssetName,
): ButtonSkin {
    return {
        normal: texture[normal],
        hover: texture[hover],
        active: texture[active],
    };
}
