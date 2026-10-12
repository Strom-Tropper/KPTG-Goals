import { Rectangle } from "pixi.js";

export type BonusLayoutMode = "landscape" | "portrait";

type HidingSpotLayout = {
    coverTexture: string;
    coverPosition: readonly [number, number];
    characterPosition: readonly [number, number];
    pointerPosition: readonly [number, number];
    characterScale: number;
    zIndex: number;
};

export type BonusGameLayout = {
    width: number;
    height: number;
    nazgulPosition: readonly [number, number];
    header: {
        leftPosition: readonly [number, number];
        rightPosition: readonly [number, number];
        titlePosition: readonly [number, number];
        titleFontSize: number;
    };
    spots: readonly HidingSpotLayout[];
};

const CHARACTER_WIDTH = 535;
const CHARACTER_HEIGHT = 402;
const HIT_AREA_PADDING = 20;

export function createCharacterHitArea(
    [x, y]: readonly [number, number],
    scale: number,
): Rectangle {
    return new Rectangle(
        x - HIT_AREA_PADDING,
        y - HIT_AREA_PADDING,
        CHARACTER_WIDTH * scale + HIT_AREA_PADDING * 2,
        CHARACTER_HEIGHT * scale + HIT_AREA_PADDING * 2,
    );
}

const LANDSCAPE_SPOTS: readonly HidingSpotLayout[] = [
    {
        coverTexture: "bonus_root.png",
        coverPosition: [68, 244],
        characterPosition: [254, 479],
        pointerPosition: [375, 565],
        characterScale: 0.6,
        zIndex: 11,
    },
    {
        coverTexture: "bonus_log.png",
        coverPosition: [500, 392],
        characterPosition: [660, 464],
        pointerPosition: [732, 480],
        characterScale: 0.5,
        zIndex: 10,
    },
    {
        coverTexture: "bonus_fernbush.png",
        coverPosition: [958, 416],
        characterPosition: [1120, 513],
        pointerPosition: [1252, 531],
        characterScale: 0.6,
        zIndex: 13,
    },
    {
        coverTexture: "bonus_leafpile.png",
        coverPosition: [-322, 686],
        characterPosition: [110, 744],
        pointerPosition: [260, 860],
        characterScale: 0.85,
        zIndex: 15,
    },
    {
        coverTexture: "bonus_crevice.png",
        coverPosition: [510, 652],
        characterPosition: [665, 698],
        pointerPosition: [783, 799],
        characterScale: 0.65,
        zIndex: 12,
    },
    {
        coverTexture: "bonus_boulder.png",
        coverPosition: [1104, 610],
        characterPosition: [1406, 724],
        pointerPosition: [1549, 810],
        characterScale: 0.75,
        zIndex: 14,
    },
];

const PORTRAIT_SPOTS: readonly HidingSpotLayout[] = [
    {
        coverTexture: "bonus_root.png",
        coverPosition: [-210, 714],
        characterPosition: [0, 976],
        pointerPosition: [97, 1011],
        characterScale: 0.7,
        zIndex: 11,
    },
    {
        coverTexture: "bonus_log.png",
        coverPosition: [260, 926],
        characterPosition: [412, 930],
        pointerPosition: [497, 1011],
        characterScale: 0.6,
        zIndex: 10,
    },
    {
        coverTexture: "bonus_fernbush.png",
        coverPosition: [570, 1050],
        characterPosition: [700, 1116],
        pointerPosition: [816, 1185],
        characterScale: 0.75,
        zIndex: 13,
    },
    {
        coverTexture: "bonus_leafpile.png",
        coverPosition: [-388, 1484],
        characterPosition: [-30, 1512],
        pointerPosition: [184, 1693],
        characterScale: 1,
        zIndex: 15,
    },
    {
        coverTexture: "bonus_crevice.png",
        coverPosition: [-10, 1250],
        characterPosition: [130, 1250],
        pointerPosition: [299, 1363],
        characterScale: 0.8,
        zIndex: 12,
    },
    {
        coverTexture: "bonus_boulder.png",
        coverPosition: [416, 1350],
        characterPosition: [670, 1434],
        pointerPosition: [852, 1570],
        characterScale: 0.85,
        zIndex: 14,
    },
];

export const BONUS_GAME_LAYOUTS: Record<BonusLayoutMode, BonusGameLayout> = {
    landscape: {
        width: 1920,
        height: 1080,
        nazgulPosition: [828, 110],
        header: {
            leftPosition: [265, 58],
            rightPosition: [1466, 58],
            titlePosition: [960, 70],
            titleFontSize: 83,
        },
        spots: LANDSCAPE_SPOTS,
    },
    portrait: {
        width: 1080,
        height: 1920,
        nazgulPosition: [408, 520],
        header: {
            leftPosition: [-159, 118],
            rightPosition: [1041, 118],
            titlePosition: [540, 130],
            titleFontSize: 83,
        },
        spots: PORTRAIT_SPOTS,
    },
};
