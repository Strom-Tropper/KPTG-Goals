// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import { Container, Sprite } from "pixi.js";
//
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import { i18n } from "@/shared/i18n/I18nManager";
// import type { MainGameLayoutMode } from "../layouts";
// import { applyInfoTitleStyle } from "./applyInfoTitleStyle";
//
// export type InfoFreespinView = Container & {
//     refreshTranslations: () => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
// };
//
// type FreespinLayout = {
//     descriptionFontSize: number;
//     descriptionLineHeight: number;
//     divider: readonly [number, number];
//     dividerRotation: number;
//     dividerSize: readonly [number, number];
//     header: readonly [number, number];
//     headerSize: readonly [number, number];
//     map: readonly [number, number];
//     mapSize: readonly [number, number];
//     mapTexture: string;
//     mapDescription: readonly [number, number];
//     title: readonly [number, number];
//     waypointImageX: number;
//     waypointImageSize: readonly [number, number];
//     waypointDescriptionFontSize: number;
//     waypointRows: readonly number[];
//     waypointTextOffsetY: number;
//     waypointTextX: number;
// };
//
// const LAYOUTS: Record<MainGameLayoutMode, FreespinLayout> = {
//     landscape: {
//         descriptionFontSize: 32,
//         descriptionLineHeight: 38,
//         divider: [-198, 22],
//         dividerRotation: Math.PI / 2,
//         dividerSize: [600, 7],
//         header: [0, -408],
//         headerSize: [621, 189],
//         map: [-426, -95],
//         mapSize: [286, 420],
//         mapTexture: "info_freespin_map.png",
//         mapDescription: [-590, 224],
//         title: [0, -398],
//         waypointImageX: -30,
//         waypointImageSize: [294, 145],
//         waypointDescriptionFontSize: 32,
//         waypointRows: [-188, 28, 242],
//         waypointTextOffsetY: 0,
//         waypointTextX: 137,
//     },
//     portrait: {
//         descriptionFontSize: 32,
//         descriptionLineHeight: 38,
//         divider: [0, -123],
//         dividerRotation: 0,
//         dividerSize: [615, 21],
//         header: [0, -612],
//         headerSize: [621, 189],
//         map: [0, -398],
//         mapSize: [371, 210],
//         mapTexture: "info_freespin_map_vertical.png",
//         mapDescription: [0, -220],
//         title: [0, -604],
//         waypointImageX: -233,
//         waypointImageSize: [294, 145],
//         waypointDescriptionFontSize: 28,
//         waypointRows: [-7, 195, 397],
//         waypointTextOffsetY: 7,
//         waypointTextX: -71,
//     },
// };
//
// function createPopupSprite(textureName: string, x: number, y: number) {
//     const sprite = new Sprite(gameAssets.InfoPopup.textures[textureName]);
//     sprite.anchor.set(0.5);
//     sprite.position.set(x, y);
//     sprite.eventMode = "none";
//     return sprite;
// }
//
// function createTitle() {
//     const title = createText({
//         text: "",
//         align: "center",
//         fill: 0xffc924,
//         fontFamily: FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         fontSize: 48,
//         fontWeight: "600",
//         lineHeight: 48 * 1.18,
//         stroke: { color: 0x5a3500, width: 1, join: "round" },
//         dropShadow: {
//             color: 0x000000,
//             alpha: 0.8,
//             angle: Math.PI / 2,
//             blur: 2,
//             distance: 2,
//         },
//     });
//     applyInfoTitleStyle(title);
//     title.anchor.set(0.5);
//     title.position.set(0, -383);
//     title.eventMode = "none";
//     return title;
// }
//
// function createDescription(x: number, y: number) {
//     const description = createText({
//         text: "",
//         align: "left",
//         fill: 0x341400,
//         fontFamily: FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         fontSize: 30,
//         fontWeight: "500",
//         lineHeight: 38,
//         tagStyles: {
//             emphasis: { fontWeight: "800" },
//         },
//     });
//     description.style.padding = 4;
//     description.anchor.set(0, 0.5);
//     description.position.set(x, y);
//     description.eventMode = "none";
//     return description;
// }
//
// function emphasizeFreeSpins(text: string) {
//     return text.replace(/^(\d+\s+Free Spins\.)/, "<emphasis>$1</emphasis>");
// }
//
// export function createInfoFreespin(): InfoFreespinView {
//     const page = new Container({ label: "InfoFreespin" }) as InfoFreespinView;
//
//     const header = createPopupSprite("info_panel_header.png", 0, -396);
//     const title = createTitle();
//
//     const map = createPopupSprite("info_freespin_map.png", -405, -78);
//     const mapDescription = createDescription(-405, 263);
//
//     const divider = createPopupSprite("info_freespin_decor_bar.png", -210, 17);
//     divider.rotation = Math.PI / 2;
//
//     const mountDoom = createPopupSprite(
//         "info_freespin_mountdoom.png",
//         -28,
//         -188,
//     );
//     const lothlorien = createPopupSprite(
//         "info_freespin_lothlorien.png",
//         -28,
//         38,
//     );
//     const rivendell = createPopupSprite(
//         "info_freespin_rivendell.png",
//         -28,
//         242,
//     );
//
//     const mountDoomDescription = createDescription(350, -188);
//     const lothlorienDescription = createDescription(350, 38);
//     const rivendellDescription = createDescription(350, 242);
//
//     page.addChild(
//         header,
//         title,
//         map,
//         mapDescription,
//         divider,
//         mountDoom,
//         lothlorien,
//         rivendell,
//         mountDoomDescription,
//         lothlorienDescription,
//         rivendellDescription,
//     );
//
//     let layoutMode: MainGameLayoutMode = "landscape";
//
//     page.refreshTranslations = () => {
//         const translationKey = `info.${layoutMode}.freespin`;
//         title.text = i18n.t(`${translationKey}.title`);
//         mapDescription.text = i18n.t(`${translationKey}.mapDescription`);
//         rivendellDescription.text = emphasizeFreeSpins(
//             i18n.t(`${translationKey}.rivendell`),
//         );
//         lothlorienDescription.text = emphasizeFreeSpins(
//             i18n.t(`${translationKey}.lothlorien`),
//         );
//         mountDoomDescription.text = emphasizeFreeSpins(
//             i18n.t(`${translationKey}.mountDoom`),
//         );
//     };
//
//     page.setLayout = (mode) => {
//         layoutMode = mode;
//         const layout = LAYOUTS[mode];
//
//         page.scale.set(1);
//         page.position.set(0, 0);
//         header.position.set(...layout.header);
//         header.setSize(...layout.headerSize);
//         title.position.set(...layout.title);
//         map.texture = gameAssets.InfoPopup.textures[layout.mapTexture];
//         map.position.set(...layout.map);
//         map.setSize(...layout.mapSize);
//         mapDescription.position.set(...layout.mapDescription);
//         mapDescription.anchor.x = mode === "portrait" ? 0.5 : 0;
//         mapDescription.style.align = mode === "portrait" ? "center" : "left";
//         mapDescription.style.fontSize = layout.descriptionFontSize;
//         mapDescription.style.lineHeight = layout.descriptionLineHeight;
//         divider.position.set(...layout.divider);
//         divider.setSize(...layout.dividerSize);
//         divider.rotation = layout.dividerRotation;
//
//         const waypointImages =
//             mode === "portrait"
//                 ? [rivendell, lothlorien, mountDoom]
//                 : [mountDoom, lothlorien, rivendell];
//         const waypointDescriptions =
//             mode === "portrait"
//                 ? [
//                       rivendellDescription,
//                       lothlorienDescription,
//                       mountDoomDescription,
//                   ]
//                 : [
//                       mountDoomDescription,
//                       lothlorienDescription,
//                       rivendellDescription,
//                   ];
//
//         waypointImages.forEach((image, index) => {
//             image.position.set(
//                 layout.waypointImageX,
//                 layout.waypointRows[index],
//             );
//             image.setSize(...layout.waypointImageSize);
//         });
//         waypointDescriptions.forEach((description, index) => {
//             description.position.set(
//                 layout.waypointTextX,
//                 layout.waypointRows[index] + layout.waypointTextOffsetY,
//             );
//             description.style.fontSize = layout.waypointDescriptionFontSize;
//             description.style.lineHeight = layout.descriptionLineHeight;
//         });
//
//         // Apply the final metrics before changing content so Pixi creates one
//         // clean text texture for the active layout, especially on iOS/WebGL.
//         page.refreshTranslations();
//     };
//
//     page.setLayout("landscape");
//     return page;
// }
