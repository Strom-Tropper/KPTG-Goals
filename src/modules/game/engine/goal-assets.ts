export const GOAL_ASSET_NAMES = {
    cell_normal: "cell-normal",
    cell_active: "cell-active",
    cell_explode: "cell-explode",
    mark_ball: "mark-ball",
    mark_bomb: "mark-bomb",
    mark_bullet: "mark-bullet",
    mark_explode: "mark-explode",
    button_face: "button-face",
    button_plus: "button-plus",
    button_minus: "button-minus",
    button_info: "button-info",
    button_sound: "button-sound",
} as const;

type GoalAssetName = (typeof GOAL_ASSET_NAMES)[keyof typeof GOAL_ASSET_NAMES];

type GoalAssetStore = Record<GoalAssetName, string>;

export const goalAssets = {
    "cell-normal": GOAL_ASSET_NAMES.cell_normal,
    "cell-active": GOAL_ASSET_NAMES.cell_active,
    "cell-explode": GOAL_ASSET_NAMES.cell_explode,
    "mark-ball": GOAL_ASSET_NAMES.mark_ball,
    "mark-bomb": GOAL_ASSET_NAMES.mark_bomb,
    "mark-bullet": GOAL_ASSET_NAMES.mark_bullet,
    "mark-explode": GOAL_ASSET_NAMES.mark_explode,
    "button-face": GOAL_ASSET_NAMES.button_face,
    "button-plus": GOAL_ASSET_NAMES.button_plus,
    "button-minus": GOAL_ASSET_NAMES.button_minus,
    "button-info": GOAL_ASSET_NAMES.button_info,
    "button-sound": GOAL_ASSET_NAMES.button_sound,
} as GoalAssetStore;
