// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import { Container, Sprite } from "pixi.js";
//
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import { i18n } from "@/shared/i18n/I18nManager";
// import type { MainGameLayoutMode } from "../layouts";
// import { applyInfoTitleStyle } from "./applyInfoTitleStyle";
//
// export type InfoJackpotView = Container & {
//     refreshTranslations: () => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
// };
//
// type JackpotLayout = {
//     collectRings: readonly [number, number];
//     collectRingsWidth: number;
//     header: readonly [number, number];
//     headerSize: readonly [number, number];
//     note: readonly [number, number];
//     noteFontSize: number;
//     noteWidth: number;
//     ringHolder: readonly [number, number];
//     ringHolderSize: readonly [number, number];
//     ringHolderTexture: string;
//     stickyDescription: readonly [number, number];
//     stickyDescriptionFontSize: number;
//     stickyDescriptionWidth: number;
//     stickyTitle: readonly [number, number];
//     stickyTitleFill: number;
//     title: readonly [number, number];
// };
//
// const LAYOUTS: Record<MainGameLayoutMode, JackpotLayout> = {
//     landscape: {
//         collectRings: [155, 72],
//         collectRingsWidth: 820,
//         header: [0, -408],
//         headerSize: [621, 189],
//         note: [155, 285],
//         noteFontSize: 32,
//         noteWidth: 820,
//         ringHolder: [-426, 0],
//         ringHolderSize: [298, 605],
//         ringHolderTexture: "info_jackpot_ringholder_ring.png",
//         stickyDescription: [155, -158],
//         stickyDescriptionFontSize: 32,
//         stickyDescriptionWidth: 800,
//         stickyTitle: [155, -248],
//         stickyTitleFill: 0xa7440b,
//         title: [0, -398],
//     },
//     portrait: {
//         collectRings: [0, 205],
//         collectRingsWidth: 760,
//         header: [0, -612],
//         headerSize: [621, 189],
//         note: [0, 426],
//         noteFontSize: 32,
//         noteWidth: 760,
//         ringHolder: [0, -110],
//         ringHolderSize: [608, 308],
//         ringHolderTexture: "info_jackpot_ringholder_ring_vertical.png",
//         stickyDescription: [0, -358],
//         stickyDescriptionFontSize: 32,
//         stickyDescriptionWidth: 760,
//         stickyTitle: [0, -449],
//         stickyTitleFill: 0xa7440b,
//         title: [0, -604],
//     },
// };
//
// function createSprite(
//     sheet: "MainSceneSheet" | "InfoPopup",
//     textureName: string,
//     x: number,
//     y: number,
// ) {
//     const sprite = new Sprite(gameAssets[sheet].textures[textureName]);
//     sprite.anchor.set(0.5);
//     sprite.position.set(x, y);
//     sprite.eventMode = "none";
//     return sprite;
// }
//
// function createTextLabel(
//     fontSize: number,
//     x: number,
//     y: number,
//     fontFamily: (typeof FONT_FAMILY)[keyof typeof FONT_FAMILY] = FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//     fontWeight?: "500" | "600" | "700" | "800",
//     fill = 0x2b160e,
// ) {
//     const label = createText({
//         text: "",
//         align: "center",
//         fill,
//         fontFamily,
//         fontSize,
//         fontWeight,
//         lineHeight: fontSize * 1.22,
//     });
//     label.anchor.set(0.5);
//     label.position.set(x, y);
//     label.eventMode = "none";
//     return label;
// }
//
// function createTitle() {
//     const title = createTextLabel(
//         48,
//         0,
//         -383,
//         FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//         "600",
//     );
//     applyInfoTitleStyle(title);
//     return title;
// }
//
// function createRingHolder() {
//     return createSprite(
//         "InfoPopup",
//         "info_jackpot_ringholder_ring.png",
//         -426,
//         0,
//     );
// }
//
// export function createInfoJackpot(): InfoJackpotView {
//     const page = new Container({ label: "InfoJackpot" }) as InfoJackpotView;
//
//     const header = createSprite("InfoPopup", "info_panel_header.png", 0, -396);
//     const title = createTitle();
//     const ringHolder = createRingHolder();
//
//     const stickyRingsTitle = createTextLabel(
//         40,
//         155,
//         -218,
//         FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         "800",
//         0xa7440b,
//     );
//     const stickyRingsDescription = createTextLabel(
//         32,
//         155,
//         -137,
//         FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         "500",
//         0x341400,
//     );
//     const collectRings = createTextLabel(
//         32,
//         155,
//         35,
//         FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         "500",
//         0x341400,
//     );
//     collectRings.style.lineHeight = 40;
//     collectRings.style.tagStyles = {
//         ringCount: { fontWeight: "600" },
//         reward: { fill: 0xa7440b },
//     };
//     const note = createTextLabel(
//         32,
//         155,
//         190,
//         FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         "500",
//         0x341400,
//     );
//
//     page.addChild(
//         header,
//         title,
//         ringHolder,
//         stickyRingsTitle,
//         stickyRingsDescription,
//         collectRings,
//         note,
//     );
//
//     let layoutMode: MainGameLayoutMode = "landscape";
//
//     page.refreshTranslations = () => {
//         const translationKey = `info.${layoutMode}.jackpot`;
//         title.text = i18n.t(`${translationKey}.title`);
//         stickyRingsTitle.text = i18n.t(`${translationKey}.stickyRingsTitle`);
//         stickyRingsDescription.text = i18n.t(
//             `${translationKey}.stickyRingsDescription`,
//         );
//         collectRings.text = i18n.t(`${translationKey}.collectRings`);
//         note.text = i18n.t(`${translationKey}.note`);
//     };
//
//     page.setLayout = (mode) => {
//         layoutMode = mode;
//         page.refreshTranslations();
//         const layout = LAYOUTS[mode];
//
//         page.scale.set(1);
//         page.position.set(0, 0);
//         header.position.set(...layout.header);
//         header.setSize(...layout.headerSize);
//         title.position.set(...layout.title);
//         ringHolder.texture =
//             gameAssets.InfoPopup.textures[layout.ringHolderTexture];
//         ringHolder.position.set(...layout.ringHolder);
//         ringHolder.setSize(...layout.ringHolderSize);
//         stickyRingsTitle.position.set(...layout.stickyTitle);
//         stickyRingsTitle.style.fill = layout.stickyTitleFill;
//         stickyRingsDescription.position.set(...layout.stickyDescription);
//         stickyRingsDescription.style.fontSize =
//             layout.stickyDescriptionFontSize;
//         stickyRingsDescription.style.wordWrap = true;
//         stickyRingsDescription.style.wordWrapWidth =
//             layout.stickyDescriptionWidth;
//         collectRings.position.set(...layout.collectRings);
//         collectRings.style.wordWrap = true;
//         collectRings.style.wordWrapWidth = layout.collectRingsWidth;
//         note.position.set(...layout.note);
//         note.style.fontSize = layout.noteFontSize;
//         note.style.wordWrap = true;
//         note.style.wordWrapWidth = layout.noteWidth;
//     };
//
//     page.refreshTranslations();
//     page.setLayout("landscape");
//     return page;
// }
