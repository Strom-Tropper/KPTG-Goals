// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import { Container, Sprite } from "pixi.js";
//
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import { gameEngine } from "@/modules/game/engine/game.engine";
// import { gameState } from "@/modules/game/engine/game.state";
// import type { LorePay } from "@/modules/game/engine/game.types";
// import { i18n } from "@/shared/i18n/I18nManager";
// import { format } from "@/shared/utils/formatNumber";
// import type { MainGameLayoutMode } from "../layouts";
// import { applyInfoTitleStyle } from "./applyInfoTitleStyle";
//
// export type InfoLorePayoutView = Container & {
//     refreshBet: (totalBet?: number) => void;
//     refreshTranslations: () => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
// };
//
// type LoreGroup = {
//     symbols: string[];
//     x: number;
//     y: number;
//     titleKey: string;
//     lorePayKey: keyof LorePay;
// };
//
// type LorePayoutLayout = {
//     groupPositions: ReadonlyArray<readonly [number, number]>;
//     groupTitleY: number;
//     header: readonly [number, number];
//     headerSize: readonly [number, number];
//     instruction: readonly [number, number];
//     instructionFontSize: number;
//     instructionLineHeight: number;
//     payoutFontSize: number;
//     symbolScale: number;
//     title: readonly [number, number];
//     groupTitleFontSize: number;
//     payoutY: number;
// };
//
// const GROUPS: LoreGroup[] = [
//     {
//         symbols: [
//             "info_symbol_sam.png",
//             "info_symbol_frodo.png",
//             "info_symbol_gollum.png",
//         ],
//         x: -410,
//         y: -78,
//         titleKey: "burdenOfTheRing",
//         lorePayKey: "burden_of_the_ring",
//     },
//     {
//         symbols: [
//             "info_symbol_gimli.png",
//             "info_symbol_legolas.png",
//             "info_symbol_aragorn.png",
//         ],
//         x: 0,
//         y: -78,
//         titleKey: "threeHunters",
//         lorePayKey: "three_hunters",
//     },
//     {
//         symbols: [
//             "info_symbol_frodo.png",
//             "info_symbol_ring.png",
//             "info_symbol_wraith.png",
//         ],
//         x: 410,
//         y: -78,
//         titleKey: "knightInTheDark",
//         lorePayKey: "blade_in_the_dark",
//     },
//     {
//         symbols: [
//             "info_symbol_merry.png",
//             "info_symbola_pippin.png",
//             "info_symbol_lembas.png",
//         ],
//         x: -215,
//         y: 205,
//         titleKey: "secondBreakfast",
//         lorePayKey: "second_breakfast",
//     },
//     {
//         symbols: [
//             "info_symbol_gandalf.png",
//             "info_symbol_saruman.png",
//             "info_symbol_palantir.png",
//         ],
//         x: 235,
//         y: 205,
//         titleKey: "wizardsDuel",
//         lorePayKey: "wizards_duel",
//     },
// ];
//
// const LAYOUTS: Record<MainGameLayoutMode, LorePayoutLayout> = {
//     landscape: {
//         groupPositions: [
//             [-405, -85],
//             [-7, -85],
//             [400, -85],
//             [-190, 180],
//             [223, 180],
//         ],
//         groupTitleFontSize: 28,
//         groupTitleY: 106,
//         header: [0, -408],
//         headerSize: [621, 189],
//         instruction: [0, -245],
//         instructionFontSize: 32,
//         instructionLineHeight: 38,
//         payoutFontSize: 35,
//         payoutY: 140,
//         symbolScale: 1,
//         title: [0, -398],
//     },
//     portrait: {
//         groupPositions: [
//             [-200, -266],
//             [194, -266],
//             [-204, 20],
//             [194, 20],
//             [0, 314],
//         ],
//         groupTitleFontSize: 24,
//         groupTitleY: 94,
//         header: [0, -612],
//         headerSize: [621, 189],
//         instruction: [0, -424],
//         instructionFontSize: 32,
//         instructionLineHeight: 36,
//         payoutFontSize: 35,
//         payoutY: 130,
//         symbolScale: 0.8,
//         title: [0, -604],
//     },
// };
//
// function createLabel(
//     fontSize: number,
//     fill: number,
//     fontFamily: (typeof FONT_FAMILY)[keyof typeof FONT_FAMILY] = FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//     fontWeight?: "500" | "600" | "700" | "800",
//     letterSpacing = 0,
// ) {
//     const text = createText({
//         text: "",
//         align: "center",
//         fill,
//         fontFamily,
//         fontSize,
//         fontWeight,
//         letterSpacing,
//         lineHeight: fontSize * 1.15,
//     });
//     text.anchor.set(0.5);
//     text.eventMode = "none";
//     return text;
// }
//
// function createPayoutLabel() {
//     const payout = createText({
//         fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//         fontWeight: "400",
//         fontSize: 25,
//         text: "200,000",
//         fill: "#341400",
//         letterSpacing: 0,
//     });
//     payout.anchor.set(0.5);
//     payout.eventMode = "none";
//     return payout;
// }
//
// function addGroup(page: Container, group: LoreGroup) {
//     const container = new Container({ label: `LorePayout-${group.titleKey}` });
//     container.position.set(group.x, group.y);
//     const symbols: Sprite[] = [];
//
//     group.symbols.forEach((textureName, index) => {
//         const symbol = new Sprite(gameAssets.InfoPopup.textures[textureName]);
//         symbol.anchor.set(0.5);
//         const yOffset = index === 1 ? -12 : 0;
//         symbol.position.set((index - 1) * 100, yOffset);
//         container.addChild(symbol);
//         symbols.push(symbol);
//     });
//
//     const title = createLabel(28, 0x8f3c04, FONT_FAMILY.EB_GARAMOND, "700", 0);
//     title.position.set(0, 92);
//     const payout = createPayoutLabel();
//     payout.position.set(0, 128);
//     container.addChild(title, payout);
//     page.addChild(container);
//     return { container, payout, symbols, title };
// }
//
// export function createInfoLorePayout(): InfoLorePayoutView {
//     const page = new Container({
//         label: "InfoLorePayout",
//     }) as InfoLorePayoutView;
//
//     const header = new Sprite(
//         gameAssets.InfoPopup.textures["info_panel_header.png"],
//     );
//     header.anchor.set(0.5);
//     header.position.set(0, -396);
//     const title = createLabel(
//         48,
//         0xffc924,
//         FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//         "600",
//     );
//     applyInfoTitleStyle(title);
//     title.position.set(header.x, -383);
//
//     const instruction = createLabel(
//         32,
//         0x341400,
//         FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         "500",
//     );
//     instruction.position.set(0, -255);
//
//     const groupViews = GROUPS.map((group) => ({
//         ...addGroup(page, group),
//         titleKey: group.titleKey,
//         lorePayKey: group.lorePayKey,
//     }));
//
//     page.addChild(header, title, instruction);
//
//     let layoutMode: MainGameLayoutMode = "landscape";
//
//     page.refreshTranslations = () => {
//         const translationKey = `info.${layoutMode}.lorePayout`;
//         title.text = i18n.t(`${translationKey}.title`);
//         instruction.text = i18n.t(`${translationKey}.instruction`);
//         groupViews.forEach((group) => {
//             group.title.text = i18n.t(
//                 `${translationKey}.stories.${group.titleKey}`,
//             );
//         });
//     };
//
//     page.refreshBet = (totalBet = gameEngine.GetTotalBet()) => {
//         groupViews.sort((a, b) => {
//             const aMultiplier = gameState.lore_pay[a.lorePayKey];
//             const bMultiplier = gameState.lore_pay[b.lorePayKey];
//
//             return (bMultiplier ?? -Infinity) - (aMultiplier ?? -Infinity);
//         });
//
//         groupViews.forEach((group) => {
//             const multiplier = gameState.lore_pay[group.lorePayKey];
//             group.payout.text =
//                 typeof multiplier === "number"
//                     ? format(totalBet * multiplier, 0)
//                     : "";
//         });
//
//         const layout = LAYOUTS[layoutMode];
//         groupViews.forEach((group, index) => {
//             group.container.position.set(...layout.groupPositions[index]);
//         });
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
//         instruction.position.set(...layout.instruction);
//         instruction.style.fontSize = layout.instructionFontSize;
//         instruction.style.lineHeight = layout.instructionLineHeight;
//
//         groupViews.forEach((group, index) => {
//             group.container.position.set(...layout.groupPositions[index]);
//             group.title.style.fontSize = layout.groupTitleFontSize;
//             group.title.y = layout.groupTitleY;
//             group.payout.style.fontSize = layout.payoutFontSize;
//             group.payout.y = layout.payoutY;
//             group.symbols.forEach((symbol) => {
//                 symbol.scale.set(layout.symbolScale);
//             });
//         });
//     };
//
//     page.refreshTranslations();
//     page.refreshBet();
//     page.setLayout("landscape");
//     return page;
// }
