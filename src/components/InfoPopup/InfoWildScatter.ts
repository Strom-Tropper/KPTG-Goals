// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import { Container, Sprite } from "pixi.js";
//
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import { i18n } from "@/shared/i18n/I18nManager";
// import type { MainGameLayoutMode } from "../layouts";
// import { applyInfoTitleStyle } from "./applyInfoTitleStyle";
//
// export type InfoWildScatterView = Container & {
//     refreshTranslations: () => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
// };
//
// type WildScatterLayout = {
//     descriptionAlign: "center" | "left";
//     descriptionAnchorX: number;
//     descriptionFontSize: number;
//     descriptionLineHeight: number;
//     descriptionPositions: ReadonlyArray<readonly [number, number]>;
//     descriptionWidth: number;
//     header: readonly [number, number];
//     headerSize: readonly [number, number];
//     symbolPositions: ReadonlyArray<readonly [number, number]>;
//     title: readonly [number, number];
// };
//
// const LAYOUTS: Record<MainGameLayoutMode, WildScatterLayout> = {
//     landscape: {
//         descriptionAlign: "left",
//         descriptionAnchorX: 0,
//         descriptionFontSize: 32,
//         descriptionLineHeight: 38,
//         descriptionPositions: [
//             [-340, -249],
//             [-340, -79],
//             [-340, 47],
//             [-340, 239],
//         ],
//         descriptionWidth: 900,
//         header: [0, -408],
//         headerSize: [621, 189],
//         symbolPositions: [
//             [-454, -234],
//             [-454, -64],
//             [-454, 106],
//             [-454, 276],
//         ],
//         title: [0, -398],
//     },
//     portrait: {
//         descriptionAlign: "left",
//         descriptionAnchorX: 0,
//         descriptionFontSize: 32,
//         descriptionLineHeight: 41,
//         descriptionPositions: [
//             [-150, -419],
//             [-150, -143],
//             [-150, 48],
//             [-150, 384],
//         ],
//         descriptionWidth: 520,
//         header: [0, -612],
//         headerSize: [621, 189],
//         symbolPositions: [
//             [-268, -384],
//             [-268, -107],
//             [-268, 168],
//             [-268, 442],
//         ],
//         title: [0, -604],
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
//         fontFamily: FONT_FAMILY.EB_GARAMOND,
//         fontWeight: "500",
//         fontSize: 34,
//         fill: "#341400",
//         tagStyles: {
//             scatter: { fill: 0x0b7400, fontWeight: "700" },
//             strong: { fontWeight: "700" },
//             wild: { fill: 0x8f3c04, fontWeight: "700" },
//         },
//     });
//     description.anchor.set(0.5, 0);
//     description.position.set(x, y);
//     description.eventMode = "none";
//     return description;
// }
//
// function toCanvasText(text: string) {
//     return text.replace(/<br>/g, "\n");
// }
//
// export function createInfoWildScatter(): InfoWildScatterView {
//     const page = new Container({
//         label: "InfoWildScatter",
//     }) as InfoWildScatterView;
//
//     const header = createPopupSprite("info_panel_header.png", 0, -396);
//     const title = createTitle();
//
//     const conditionalWild = createPopupSprite(
//         "info_symbol_gollum.png",
//         -310,
//         -225,
//     );
//     const wild = createPopupSprite("info_symbol_ring.png", 320, -225);
//     const respinScatter = createPopupSprite(
//         "info_symbol_saruman.png",
//         -310,
//         65,
//     );
//     const bonusScatter = createPopupSprite("info_symbol_wraith.png", 320, 65);
//
//     const conditionalWildText = createDescription(-310, -130);
//     const wildText = createDescription(320, -130);
//     const respinScatterText = createDescription(-310, 158);
//     const bonusScatterText = createDescription(320, 158);
//
//     page.addChild(
//         header,
//         title,
//         conditionalWild,
//         wild,
//         respinScatter,
//         bonusScatter,
//         conditionalWildText,
//         wildText,
//         respinScatterText,
//         bonusScatterText,
//     );
//
//     let layoutMode: MainGameLayoutMode = "landscape";
//
//     page.refreshTranslations = () => {
//         const translationKey = `info.${layoutMode}.wildScatter`;
//         title.text = i18n.t(`${translationKey}.title`);
//         conditionalWildText.text = toCanvasText(
//             i18n.t(`${translationKey}.conditionalWild`),
//         );
//         wildText.text = toCanvasText(i18n.t(`${translationKey}.wild`));
//         respinScatterText.text = toCanvasText(
//             i18n.t(`${translationKey}.respinScatter`),
//         );
//         bonusScatterText.text = toCanvasText(
//             i18n.t(`${translationKey}.bonusScatter`),
//         );
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
//
//         const symbols = [conditionalWild, wild, respinScatter, bonusScatter];
//         const descriptions = [
//             conditionalWildText,
//             wildText,
//             respinScatterText,
//             bonusScatterText,
//         ];
//         symbols.forEach((symbol, index) => {
//             symbol.position.set(...layout.symbolPositions[index]);
//             symbol.setSize(158, 158);
//         });
//         descriptions.forEach((description, index) => {
//             description.anchor.x = layout.descriptionAnchorX;
//             description.position.set(...layout.descriptionPositions[index]);
//             description.style.align = layout.descriptionAlign;
//             description.style.fontSize = layout.descriptionFontSize;
//             description.style.lineHeight = layout.descriptionLineHeight;
//             description.style.wordWrap = true;
//             description.style.wordWrapWidth = layout.descriptionWidth;
//         });
//     };
//
//     page.refreshTranslations();
//     page.setLayout("landscape");
//     return page;
// }
