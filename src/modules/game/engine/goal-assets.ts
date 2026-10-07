export const goalAssets = {
    cell_normal: "cell-normal",
    cell_active: "cell-active",
    cell_explode: "cell-explode",
    mark_ball: "mark-ball",
    mark_bomb: "mark-bomb",
    mark_bullet: "mark-bullet",
    mark_explode: "mark-explode",
    button_face: "button-face",
    button_face_hover: "button-face-hover",
    button_face_active: "button-face-active",
    button_plus: "button-plus",
    button_plus_hover: "button-plus-hover",
    button_plus_active: "button-plus-active",
    button_minus: "button-minus",
    button_minus_hover: "button-minus-hover",
    button_minus_active: "button-minus-active",
    button_info: "button-info",
    button_info_hover: "button-info-hover",
    button_info_active: "button-info-active",
    button_sound: "button-sound",
    button_sound_hover: "button-sound-hover",
    button_sound_active: "button-sound-active",
} as const;

export type GoalAssetName = (typeof goalAssets)[keyof typeof goalAssets];

export const GOAL_ASSET_NAMES = Object.values(goalAssets);
