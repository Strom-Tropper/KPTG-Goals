// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import { Container, Sprite } from "pixi.js";
//
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import { i18n } from "@/shared/i18n/I18nManager";
// import type { MainGameLayoutMode } from "../layouts";
// import { applyInfoTitleStyle } from "./applyInfoTitleStyle";
//
// export type InfoBonusGameView = Container & {
//     refreshTranslations: () => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
// };
//
// type BonusGameLayout = {
//     bodyFontSize: number;
//     bodyLineHeight: number;
//     divider: readonly [number, number];
//     dividerRotation: number;
//     header: readonly [number, number];
//     headerSize: readonly [number, number];
//     instruction: readonly [number, number];
//     scatterDescription: readonly [number, number];
//     choose: readonly [number, number];
//     chooseSize: readonly [number, number];
//     win: readonly [number, number];
//     resultSize: readonly [number, number];
//     winDescription: readonly [number, number];
//     lose: readonly [number, number];
//     loseLabel: readonly [number, number];
//     scatter: readonly [number, number];
//     scatterAwards: readonly [number, number];
//     title: readonly [number, number];
// };
//
// const LAYOUTS: Record<MainGameLayoutMode, BonusGameLayout> = {
//     landscape: {
//         bodyFontSize: 32,
//         bodyLineHeight: 38,
//         header: [0, -408],
//         headerSize: [621, 189],
//         title: [0, -398],
//         scatter: [190, -230],
//         scatterAwards: [288, -224],
//         divider: [88, -242],
//         dividerRotation: 0,
//         scatterDescription: [-556, -214],
//         choose: [3, -28],
//         chooseSize: [642, 206],
//         instruction: [3, 118],
//         win: [-396, 266],
//         winDescription: [-218, 266],
//         lose: [169, 266],
//         loseLabel: [350, 266],
//         resultSize: [314, 180],
//     },
//     portrait: {
//         bodyFontSize: 32,
//         bodyLineHeight: 36,
//         header: [0, -612],
//         headerSize: [621, 189],
//         title: [0, -604],
//         scatter: [-98, -403],
//         scatterAwards: [10, -403],
//         divider: [0, -144],
//         dividerRotation: Math.PI / 2,
//         scatterDescription: [0, -244],
//         choose: [0, 2],
//         chooseSize: [642, 206],
//         instruction: [0, 160],
//         win: [-215, 352],
//         winDescription: [-215, 517],
//         lose: [192, 352],
//         loseLabel: [192, 517],
//         resultSize: [314, 180],
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
// function createBodyText(fontSize = 32, color = 0x341400) {
//     const text = createText({
//         fontFamily: FONT_FAMILY.EB_GARAMOND,
//         fontWeight: "600",
//         fontSize,
//         fill: color,
//         tagStyles: {
//             scatter: { fill: 0x0b7400 },
//         },
//     });
//     text.anchor.set(0.5);
//     text.eventMode = "none";
//     return text;
// }
//
// export function createInfoBonusGame(): InfoBonusGameView {
//     const page = new Container({ label: "InfoBonusGame" }) as InfoBonusGameView;
//
//     const header = createPopupSprite("info_panel_header.png", 0, -396);
//     const title = createBodyText(48, 0xffc924);
//     applyInfoTitleStyle(title);
//     title.position.set(header.x, -383);
//
//     const choose = createPopupSprite("info_bonusgame_choose.png", 6, -173);
//     const scatterDescription = createBodyText();
//     scatterDescription.style.fontWeight = "500";
//     scatterDescription.style.padding = 4;
//     const instruction = createBodyText();
//     instruction.style.fontWeight = "500";
//     instruction.style.padding = 4;
//     instruction.position.set(6, -14);
//
//     const divider = createPopupSprite("info_bonusgame_decor_bar.png", 0, 0);
//
//     const win = createPopupSprite("info_bonusgame_win.png", -443, 171);
//     const winDescription = createBodyText(32, 0xa7440b);
//     winDescription.anchor.set(0, 0.5);
//     winDescription.style.align = "left";
//     winDescription.style.lineHeight = 38;
//     winDescription.position.set(-286, 152);
//
//     const lose = createPopupSprite("info_bonusgame_lose.png", 34, 171);
//     const loseLabel = createBodyText(32, 0xa7440b);
//     loseLabel.position.set(46, 328);
//
//     const scatter = createPopupSprite("info_symbol_wraith.png", 460, 121);
//     const scatterAwards = createBodyText(32, 0xa7440b);
//     scatterAwards.anchor.set(0, 0.5);
//     scatterAwards.style.align = "left";
//     scatterAwards.style.lineHeight = 38;
//     scatterAwards.position.set(378, 260);
//
//     page.addChild(
//         header,
//         title,
//         choose,
//         scatterDescription,
//         instruction,
//         divider,
//         win,
//         winDescription,
//         lose,
//         loseLabel,
//         scatter,
//         scatterAwards,
//     );
//
//     let layoutMode: MainGameLayoutMode = "landscape";
//
//     page.refreshTranslations = () => {
//         const translationKey = `info.${layoutMode}.bonusGame`;
//         title.text = i18n.t(`${translationKey}.title`);
//         scatterDescription.text = i18n.t(
//             `${translationKey}.scatterDescription`,
//         );
//         instruction.text = i18n.t(`${translationKey}.instruction`);
//         winDescription.text = `${i18n.t(`${translationKey}.win`)}\n${i18n.t(`${translationKey}.winDescription`)}`;
//         loseLabel.text = `${i18n.t(`${translationKey}.lose`)}\n${i18n.t(`${translationKey}.loseDescription`)}`;
//         scatterAwards.text = i18n
//             .t(`${translationKey}.scatterAwards`)
//             .replace(/Scatters/g, "<scatter>Scatters</scatter>");
//     };
//
//     page.setLayout = (mode) => {
//         layoutMode = mode;
//         const layout = LAYOUTS[mode];
//         const isPortrait = mode === "portrait";
//
//         page.scale.set(1);
//         header.position.set(...layout.header);
//         header.setSize(...layout.headerSize);
//         title.position.set(...layout.title);
//         choose.position.set(...layout.choose);
//         choose.setSize(...layout.chooseSize);
//         scatterDescription.position.set(...layout.scatterDescription);
//         scatterDescription.anchor.set(isPortrait ? 0.5 : 0, 0.5);
//         scatterDescription.style.align = isPortrait ? "center" : "left";
//         scatterDescription.style.fontSize = layout.bodyFontSize;
//         scatterDescription.style.lineHeight = layout.bodyLineHeight;
//         instruction.position.set(...layout.instruction);
//         instruction.style.fontSize = layout.bodyFontSize;
//         instruction.style.lineHeight = layout.bodyLineHeight;
//         divider.position.set(...layout.divider);
//         divider.scale.set(1);
//         divider.rotation = layout.dividerRotation;
//         win.position.set(...layout.win);
//         win.setSize(...layout.resultSize);
//         winDescription.position.set(...layout.winDescription);
//         winDescription.anchor.set(isPortrait ? 0.5 : 0, 0.5);
//         winDescription.style.align = isPortrait ? "center" : "left";
//         winDescription.style.fontSize = layout.bodyFontSize;
//         winDescription.style.lineHeight = layout.bodyLineHeight;
//         lose.position.set(...layout.lose);
//         lose.setSize(...layout.resultSize);
//         loseLabel.position.set(...layout.loseLabel);
//         loseLabel.anchor.set(isPortrait ? 0.5 : 0, 0.5);
//         loseLabel.style.align = isPortrait ? "center" : "left";
//         loseLabel.style.fontSize = layout.bodyFontSize;
//         loseLabel.style.lineHeight = layout.bodyLineHeight;
//         scatter.position.set(...layout.scatter);
//         scatter.setSize(158, 158);
//         scatterAwards.position.set(...layout.scatterAwards);
//         scatterAwards.style.fontSize = layout.bodyFontSize;
//         scatterAwards.style.lineHeight = layout.bodyLineHeight;
//
//         // Update content only after the final metrics are in place so Pixi
//         // rasterizes one correctly-sized text texture for the active layout.
//         page.refreshTranslations();
//     };
//
//     page.setLayout("landscape");
//     return page;
// }
