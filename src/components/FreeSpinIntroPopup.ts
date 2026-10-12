// import {
//     Application,
//     Container,
//     FillGradient,
//     Graphics,
//     Renderer,
//     Sprite,
// } from "pixi.js";
// import { gsap } from "gsap";
// import Popup from "@/components/base/Popup";
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import type { FreeSpinMode } from "@/modules/game/engine/game.types";
// import {
//     MAIN_GAME_LAYOUTS,
//     type MainGameLayoutMode,
// } from "@/components/main-game/layouts";
// import { i18n } from "@/shared/i18n/I18nManager";
// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import { audioSystem } from "@/systems/audio";
//
// const DESTINATIONS = {
//     1: {
//         art: "freespin_intro_art_1_rivendell.png",
//         titleKey: "adventureMap.rivendell",
//     },
//     2: {
//         art: "freespin_intro_art_2_lothlorien.png",
//         titleKey: "adventureMap.lothlorien",
//     },
//     3: {
//         art: "freespin_intro_art_3_doom.png",
//         titleKey: "adventureMap.mountDoom",
//     },
// };
//
// const MASK_TEXTURE = "freespin_intro_scroll_paper_mask.png";
// const SCROLL_TEXTURE = "freespin_intro_scroll.png";
// const MASK_WIDTH = 957;
// const MASK_HEIGHT = 612;
// const ART_WIDTH = 1759;
// const ART_HEIGHT = 586;
// const ART_ANCHOR_X = 0.9;
// const CLOSED_SCROLL_X = 51;
// const OPEN_SCROLL_X = MASK_WIDTH / 2;
// const PAN_START_X = ART_WIDTH * ART_ANCHOR_X - MASK_WIDTH / 2;
// const PAN_END_X = MASK_WIDTH / 2 - ART_WIDTH * (1 - ART_ANCHOR_X);
// const OPEN_DURATION = 0.8;
// const OPEN_PAN_OVERLAP = 0.15;
// const PAN_DURATION = 2.1;
// const ZOOM_DELAY = 0.1;
// const ZOOM_DURATION = 1.7;
//
// const FADE_DELAY = 0.5;
// const FADE_DURATION = 0.55;
//
// export type FreeSpinIntroPopupView = Popup & {
//     showIntro: (
//         mode: Exclude<FreeSpinMode, 0>,
//         spins: number,
//         onComplete: () => void,
//     ) => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
// };
//
// export function createFreeSpinIntroPopup(
//     app: Application<Renderer>,
// ): FreeSpinIntroPopupView {
//     const popup = new Popup({
//         ticker: app.ticker,
//         overlayAlpha: 0.8,
//         closeOnEscape: false,
//         closeOnOverlay: false,
//     }) as FreeSpinIntroPopupView;
//     popup.label = "FreeSpinIntroPopup";
//     popup.zIndex = 44;
//
//     const scene = new Container({
//         label: "FreeSpinIntroScene",
//         eventMode: "none",
//     });
//     const reveal = new Container({
//         label: "FreeSpinIntroReveal",
//         eventMode: "none",
//     });
//     const art = new Sprite({
//         texture: gameAssets.FreeSpinSheet.textures[DESTINATIONS[1].art],
//     });
//     art.anchor.set(ART_ANCHOR_X, 0.5);
//     // Keep the panorama on the stencil path so it stays sharp while moving
//     // and zooming. Sprite masks use an offscreen alpha-filter pass.
//     const artMask = new Graphics()
//         .rect(-MASK_WIDTH / 2, -ART_HEIGHT / 2, MASK_WIDTH, ART_HEIGHT)
//         .fill(0xffffff);
//     const paperTexture = new Sprite({
//         texture: gameAssets.FreeSpinSheet.textures[MASK_TEXTURE],
//         anchor: 0.5,
//         eventMode: "none",
//     });
//     art.mask = artMask;
//     reveal.addChild(art, artMask, paperTexture);
//     const openingMask = new Graphics()
//         .rect(-MASK_WIDTH / 2, -MASK_HEIGHT / 2, MASK_WIDTH, MASK_HEIGHT)
//         .fill(0xffffff);
//     reveal.mask = openingMask;
//
//     const makeScroll = () =>
//         new Sprite({
//             texture: gameAssets.FreeSpinSheet.textures[SCROLL_TEXTURE],
//             anchor: 0.5,
//             eventMode: "none",
//         });
//     const leftScroll = makeScroll();
//     const rightScroll = makeScroll();
//     scene.addChild(reveal, openingMask, leftScroll, rightScroll);
//
//     // This layer is a sibling of the animated artwork, so the panorama's pan
//     // and zoom transforms never affect the text or its decorative elements.
//     const textLayer = new Container({
//         label: "FreeSpinIntroTextLayer",
//         eventMode: "none",
//     });
//     const textOpeningMask = new Graphics()
//         .rect(-MASK_WIDTH / 2, -MASK_HEIGHT / 2, MASK_WIDTH, MASK_HEIGHT)
//         .fill(0xffffff);
//     textLayer.mask = textOpeningMask;
//     const popupSprite = (textureName: string, x = 0, y = 0) =>
//         new Sprite({
//             texture: gameAssets.FreeSpinSheet.textures[textureName],
//             anchor: 0.5,
//             x,
//             y,
//             eventMode: "none",
//         });
//
//     const headerShadowGradient = new FillGradient({
//         type: "linear",
//         start: { x: 0, y: 0 },
//         end: { x: 1, y: 0 },
//         colorStops: [
//             { offset: 0, color: "rgba(0, 0, 0, 0)" },
//             { offset: 0.15, color: "rgba(0, 0, 0, 0.55)" },
//             { offset: 0.5, color: "rgba(0, 0, 0, 0.72)" },
//             { offset: 0.85, color: "rgba(0, 0, 0, 0.55)" },
//             { offset: 1, color: "rgba(0, 0, 0, 0)" },
//         ],
//     });
//     const headerShadow = new Graphics({ eventMode: "none" })
//         .roundRect(-440, -230, 880, 175, 28)
//         .fill(headerShadowGradient);
//     const subtitle = createText({
//         text: i18n.t("freeSpinIntro.subtitle"),
//         fill: 0xffe879,
//         fontFamily: FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         fontSize: 38,
//         fontWeight: "bold",
//     });
//     subtitle.anchor.set(0.5);
//     subtitle.y = -188;
//     subtitle.style.dropShadow = {
//         color: 0x171a13,
//         alpha: 0.8,
//         blur: 2,
//         distance: 1,
//         angle: Math.PI / 2,
//     };
//     const divider = popupSprite("freespin_intro_decor_bar.png", 0, -158);
//     divider.width = 734;
//
//     const titleGold = new FillGradient({
//         type: "linear",
//         start: { x: 0, y: 0 },
//         end: { x: 0, y: 1 },
//         colorStops: [
//             { offset: 0, color: 0xfff19b },
//             { offset: 0.3, color: 0xffe36b },
//             { offset: 0.6, color: 0xd9b637 },
//             { offset: 1, color: 0x85600c },
//         ],
//     });
//     const title = createText({
//         text: "",
//         fill: titleGold,
//         fontFamily: FONT_FAMILY.EB_GARAMOND_VARIABLE,
//         fontSize: 68,
//         fontWeight: "bold",
//         stroke: { color: 0xe8c768, width: 1 },
//         dropShadow: {
//             color: 0x141810,
//             alpha: 0.9,
//             blur: 2,
//             distance: 2,
//             angle: Math.PI / 2,
//         },
//     });
//     title.anchor.set(0.5);
//     title.y = -112;
//     const titleDecorLeft = popupSprite(
//         "freespin_intro_decor_left.png",
//         -322,
//         -112,
//     );
//     const titleDecorRight = popupSprite(
//         "freespin_intro_decor_right.png",
//         322,
//         -112,
//     );
//
//     const header = new Container({ y: -40, eventMode: "none" });
//     header.addChild(
//         headerShadow,
//         subtitle,
//         divider,
//         titleDecorLeft,
//         title,
//         titleDecorRight,
//     );
//
//     const amountPanel = popupSprite("freespin_intro_panel_amount.png", 0, 220);
//     const amount = new Container({ y: 224, eventMode: "none" });
//     const makeAmountText = (
//         fill: number,
//         fontSize = 46,
//         fontFamily: (typeof FONT_FAMILY)[keyof typeof FONT_FAMILY] = FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//     ) => {
//         const text = createText({
//             text: "",
//             fill,
//             fontFamily,
//             fontSize,
//             fontWeight: "bold",
//         });
//         text.anchor.set(0.5);
//         return text;
//     };
//     const prefix = makeAmountText(0xb7e565);
//     const count = makeAmountText(0xffdf00, 72, FONT_FAMILY.EB_GARAMOND);
//     const freeSpins = makeAmountText(0xffdf00);
//     const suffix = makeAmountText(0xb7e565);
//     amount.addChild(prefix, count, freeSpins, suffix);
//     textLayer.addChild(header, amountPanel, amount);
//     popup.content.addChild(scene, textLayer, textOpeningMask);
//
//     let timeline: gsap.core.Timeline | undefined;
//     let completion: (() => void) | undefined;
//
//     const resetScene = () => {
//         scene.alpha = 1;
//         scene.scale.set(1);
//         textLayer.alpha = 1;
//         textLayer.scale.set(1);
//         textOpeningMask.scale.set(0, 1);
//         reveal.scale.set(1);
//         openingMask.scale.set(0, 1);
//         art.scale.set(1);
//         art.x = PAN_START_X;
//         leftScroll.x = -CLOSED_SCROLL_X;
//         rightScroll.x = CLOSED_SCROLL_X;
//     };
//
//     const finish = () => {
//         timeline?.kill();
//         timeline = undefined;
//         const callback = completion;
//         completion = undefined;
//         popup.hide({ animated: false, callback });
//     };
//
//     const play = () => {
//         timeline?.kill();
//         resetScene();
//         timeline = gsap
//             .timeline({ onComplete: finish })
//             .to(
//                 openingMask.scale,
//                 { x: 1, duration: OPEN_DURATION, ease: "power3.inOut" },
//                 0,
//             )
//             .to(
//                 textOpeningMask.scale,
//                 { x: 1, duration: OPEN_DURATION, ease: "power3.inOut" },
//                 0,
//             )
//             .to(
//                 leftScroll,
//                 {
//                     x: -OPEN_SCROLL_X,
//                     duration: OPEN_DURATION,
//                     ease: "power3.inOut",
//                 },
//                 0,
//             )
//             .to(
//                 rightScroll,
//                 {
//                     x: OPEN_SCROLL_X,
//                     duration: OPEN_DURATION,
//                     ease: "power3.inOut",
//                 },
//                 0,
//             )
//             .to(
//                 art,
//                 { x: PAN_END_X, duration: PAN_DURATION, ease: "sine.inOut" },
//                 OPEN_DURATION - OPEN_PAN_OVERLAP,
//             )
//             .to(
//                 art.scale,
//                 {
//                     x: 1.3,
//                     y: 1.3,
//                     duration: ZOOM_DURATION,
//                     ease: "power2.inOut",
//                 },
//                 `>+${ZOOM_DELAY}`,
//             )
//             .to(
//                 scene,
//                 {
//                     alpha: 0,
//                     duration: FADE_DURATION,
//                     ease: "power2.in",
//                 },
//                 `>+${FADE_DELAY}`,
//             )
//             .to(
//                 textLayer,
//                 {
//                     alpha: 0,
//                     duration: FADE_DURATION,
//                     ease: "power2.in",
//                 },
//                 "<",
//             )
//             .to(
//                 [scene.scale, textLayer.scale, textOpeningMask.scale],
//                 {
//                     x: 1.3,
//                     y: 1.3,
//                     duration: FADE_DURATION,
//                     ease: "power2.in",
//                 },
//                 "<",
//             )
//             .to(
//                 popup.overlay,
//                 {
//                     alpha: 0,
//                     duration: FADE_DURATION,
//                     ease: "power1.out",
//                 },
//                 "<",
//             );
//     };
//
//     popup.showIntro = (mode, spins, onComplete) => {
//         const destination = DESTINATIONS[mode];
//         if (!destination || !Number.isInteger(spins) || spins <= 0) {
//             onComplete();
//             return;
//         }
//         completion?.();
//         completion = onComplete;
//         art.texture = gameAssets.FreeSpinSheet.textures[destination.art];
//         subtitle.text = i18n.t("freeSpinIntro.subtitle");
//         subtitle.scale.set(1);
//         subtitle.scale.set(Math.min(1, 680 / subtitle.width));
//         title.text = i18n.t(destination.titleKey).toUpperCase();
//         title.scale.set(1);
//         title.scale.set(Math.min(1, 650 / title.width));
//         prefix.text = i18n.t("freeSpinIntro.your");
//         count.text = String(spins);
//         freeSpins.text = i18n.t("freeSpinIntro.freeSpins");
//         suffix.text = i18n.t("freeSpinIntro.await");
//         amount.scale.set(1);
//         const words = [prefix, count, freeSpins, suffix].filter(
//             (word) => word.text.length > 0,
//         );
//         const gap = 12;
//         const amountWidth =
//             words.reduce((width, word) => width + word.width, 0) +
//             gap * (words.length - 1);
//         let wordX = -amountWidth / 2;
//         for (const word of words) {
//             word.x = wordX + word.width / 2;
//             wordX += word.width + gap;
//         }
//         amount.scale.set(Math.min(1, 680 / amountWidth));
//         audioSystem.playExclusiveSfx(
//             "sfx_transition_freespin",
//             "freespin-transition",
//             false,
//         );
//         popup.showImmediately(play);
//     };
//
//     popup.setLayout = (mode) => {
//         const layout = MAIN_GAME_LAYOUTS[mode];
//         popup.content.position.set(
//             layout.width / 2,
//             layout.height / 2 - (mode === "landscape" ? 27 : 0),
//         );
//         popup.setContentLayoutScale(mode === "portrait" ? 0.9 : 1);
//     };
//     popup.setLayout("landscape");
//
//     const destroy = popup.destroy.bind(popup);
//     popup.destroy = (...args: Parameters<Popup["destroy"]>) => {
//         if (popup.destroyed) return;
//         timeline?.kill();
//         timeline = undefined;
//         completion = undefined;
//         headerShadowGradient.destroy();
//         titleGold.destroy();
//         destroy(...args);
//     };
//     return popup;
// }
