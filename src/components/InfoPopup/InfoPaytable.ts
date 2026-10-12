// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import { Container, Sprite, type Text } from "pixi.js";
//
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import { gameEngine } from "@/modules/game/engine/game.engine";
// import { gameState } from "@/modules/game/engine/game.state";
// import { i18n } from "@/shared/i18n/I18nManager";
// import { format } from "@/shared/utils/formatNumber";
// import type { MainGameLayoutMode } from "../layouts";
// import { applyInfoTitleStyle } from "./applyInfoTitleStyle";
//
// export type InfoPaytableView = Container & {
//     refreshBet: (totalBet?: number) => void;
//     refreshTranslations: () => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
// };
//
// type PaytableLayout = {
//     columns: readonly number[];
//     frame: readonly [number, number];
//     frameTexture: string;
//     header: readonly [number, number];
//     headerSize: readonly [number, number];
//     matchDescription: readonly [number, number];
//     matchThree: readonly [number, number];
//     matched: readonly [number, number];
//     payoutOffsetY: number;
//     rows: readonly number[];
//     textFrame: readonly [number, number];
//     textFrameVisible: boolean;
//     title: readonly [number, number];
// };
//
// const LAYOUTS: Record<MainGameLayoutMode, PaytableLayout> = {
//     landscape: {
//         columns: [-505, -280, -54, 171],
//         frame: [428, 22],
//         frameTexture: "info_paytable_frame.png",
//         header: [0, -408],
//         headerSize: [621, 189],
//         matchDescription: [428, 20],
//         matchThree: [428, -167],
//         matched: [428, 220],
//         payoutOffsetY: 100,
//         rows: [-205, 5, 216],
//         textFrame: [428, 20],
//         textFrameVisible: false,
//         title: [0, -398],
//     },
//     portrait: {
//         columns: [-294, -102, 91, 284],
//         frame: [-5, 403],
//         frameTexture: "info_paytable_frame_vertical.png",
//         header: [0, -612],
//         headerSize: [621, 189],
//         matchDescription: [-1, 405],
//         matchThree: [-216, 414],
//         matched: [215, 414],
//         payoutOffsetY: 100,
//         rows: [-400, -177, 44],
//         textFrame: [-1, 405],
//         textFrameVisible: true,
//         title: [0, -604],
//     },
// };
//
// const SYMBOLS = [
//     { id: 12, textureName: "info_symbol_gandalf.png" },
//     { id: 11, textureName: "info_symbol_aragorn.png" },
//     { id: 10, textureName: "info_symbol_legolas.png" },
//     { id: 9, textureName: "info_symbol_gimli.png" },
//     { id: 8, textureName: "info_symbol_frodo.png" },
//     { id: 7, textureName: "info_symbol_sam.png" },
//     { id: 6, textureName: "info_symbol_merry.png" },
//     { id: 5, textureName: "info_symbola_pippin.png" },
//     { id: 4, textureName: "info_symbol_palantir.png" },
//     { id: 3, textureName: "info_symbol_sting.png" },
//     { id: 2, textureName: "info_symbol_lembas.png" },
//     { id: 1, textureName: "info_symbol_phial.png" },
// ] as const;
//
// function createPopupSprite(textureName: string, x: number, y: number) {
//     const sprite = new Sprite(gameAssets.InfoPopup.textures[textureName]);
//     sprite.anchor.set(0.5);
//     sprite.position.set(x, y);
//     sprite.eventMode = "none";
//     return sprite;
// }
//
// function createLabel(
//     fontSize: number,
//     fill: number,
//     fontFamily: (typeof FONT_FAMILY)[keyof typeof FONT_FAMILY] = FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//     fontWeight?: "600" | "700",
// ) {
//     const text = createText({
//         text: "",
//         align: "center",
//         fill,
//         fontFamily,
//         fontSize,
//         fontWeight,
//         lineHeight: fontSize * 1.15,
//     });
//     text.anchor.set(0.5);
//     text.eventMode = "none";
//     return text;
// }
//
// export function createInfoPaytable(): InfoPaytableView {
//     const page = new Container({ label: "InfoPaytable" }) as InfoPaytableView;
//
//     const header = createPopupSprite("info_panel_header.png", 0, -396);
//     const title = createLabel(
//         48,
//         0xffc924,
//         FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//         "600",
//     );
//     applyInfoTitleStyle(title);
//     title.position.set(header.x, -383);
//
//     const symbolSprites: Sprite[] = [];
//     const payoutLabels: Text[] = [];
//     const { columns, rows } = LAYOUTS.landscape;
//     SYMBOLS.forEach(({ textureName }, index) => {
//         const column = index % columns.length;
//         const row = Math.floor(index / columns.length);
//         const symbol = createPopupSprite(
//             textureName,
//             columns[column],
//             rows[row],
//         );
//         symbolSprites.push(symbol);
//         page.addChild(symbol);
//         const payout = createText({
//             fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//             fontWeight: "500",
//             fontSize: 25,
//             text: "200,000",
//             fill: "#341400",
//             letterSpacing: 0,
//         });
//
//         payout.anchor.set(0.5);
//         payout.eventMode = "none";
//         payout.position.set(columns[column], rows[row] + 91);
//         payoutLabels.push(payout);
//         page.addChild(payout);
//     });
//
//     const paytableFrame = createPopupSprite("info_paytable_frame.png", 435, 20);
//     const textFrame = createPopupSprite(
//         "info_paytable_text_frame.png",
//         435,
//         20,
//     );
//     textFrame.visible = false;
//     const matchThree = createPopupSprite("info_paytable_match3.png", 435, -178);
//     const matchDescription = createLabel(
//         19.19,
//         0xffde7b,
//         FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         "600",
//     );
//     matchDescription.position.set(435, 22);
//     const matched = createPopupSprite("info_paytable_matched.png", 435, 225);
//
//     page.addChild(
//         paytableFrame,
//         textFrame,
//         matchThree,
//         matchDescription,
//         matched,
//         header,
//         title,
//     );
//
//     let layoutMode: MainGameLayoutMode = "landscape";
//
//     page.refreshTranslations = () => {
//         const translationKey = `info.${layoutMode}.paytable`;
//         title.text = i18n.t(`${translationKey}.title`);
//         matchDescription.text = i18n.t(`${translationKey}.matchDescription`);
//     };
//
//     page.refreshBet = (totalBet = gameEngine.GetTotalBet()) => {
//         payoutLabels.forEach((payout, index) => {
//             const multiplier = gameState.paytable[SYMBOLS[index].id]?.["3"];
//             payout.text =
//                 typeof multiplier === "number"
//                     ? format(totalBet * multiplier, 0)
//                     : "";
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
//
//         symbolSprites.forEach((symbol, index) => {
//             const column = index % layout.columns.length;
//             const row = Math.floor(index / layout.columns.length);
//             symbol.position.set(layout.columns[column], layout.rows[row]);
//         });
//         payoutLabels.forEach((payout, index) => {
//             const column = index % layout.columns.length;
//             const row = Math.floor(index / layout.columns.length);
//             payout.position.set(
//                 layout.columns[column],
//                 layout.rows[row] + layout.payoutOffsetY,
//             );
//         });
//
//         paytableFrame.texture =
//             gameAssets.InfoPopup.textures[layout.frameTexture];
//         paytableFrame.position.set(...layout.frame);
//         textFrame.position.set(...layout.textFrame);
//         textFrame.visible = layout.textFrameVisible;
//         matchThree.position.set(...layout.matchThree);
//         matchDescription.position.set(...layout.matchDescription);
//         matched.position.set(...layout.matched);
//     };
//
//     page.refreshTranslations();
//     page.refreshBet();
//     page.setLayout("landscape");
//     return page;
// }
