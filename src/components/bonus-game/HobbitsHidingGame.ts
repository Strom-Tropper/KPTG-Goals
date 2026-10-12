// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import { i18n } from "@/shared/i18n/I18nManager";
// import { Container, FillGradient, Sprite, type Texture } from "pixi.js";
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import { gameRequests } from "@/modules/game/handlers/game.requests";
// import { gameEngine } from "@/modules/game/engine/game.engine";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import { audioSystem } from "@/systems/audio";
// import { format } from "@/shared/utils/formatNumber";
// import {
//     animateNumber,
//     type NumberAnimation,
// } from "@/shared/utils/animateNumber";
// import type {
//     MiniGameState,
//     ResponseMiniGameType,
// } from "@/modules/game/engine/game.types";
// import {
//     BONUS_GAME_LAYOUTS,
//     createCharacterHitArea,
//     type BonusLayoutMode,
// } from "@/components/bonus-game/layouts";
// import {
//     BonusGameCharacterAnim,
//     type BonusGameCharacterName,
// } from "@/animations/BonusGameCharacterAnim";
// import { BonusGameNazgulAnim } from "@/animations/BonusGameNazgulAnim";
// import { BonusGameMissEffect } from "@/animations/BonusGameMissEffect";
// import { applyInfoTitleStyle } from "@/components/main-game/InfoPopup/applyInfoTitleStyle";
//
// export type HobbitsHidingBonusGame = Container & {
//     start: (state?: Partial<MiniGameState>, onComplete?: () => void) => void;
//     setLayout: (mode: BonusLayoutMode) => void;
// };
//
// function getBonusTexture(name: string): Texture {
//     const texture = gameAssets.BonusGameSheet.textures[name];
//     if (!texture) throw new Error(`[BonusGame] Texture not found: ${name}`);
//     return texture;
// }
//
// function getOptionalBonusTexture(name: string): Texture | undefined {
//     return gameAssets.BonusGameSheet.textures[name];
// }
//
// function getCoverStateTextureName(
//     coverTexture: string,
//     state: "highlighted" | "pressed",
// ) {
//     return coverTexture.replace(/\.png$/, `_${state}.png`);
// }
//
// function createSprite(name: string, x: number, y: number): Sprite {
//     const sprite = new Sprite(getBonusTexture(name));
//     sprite.label = name;
//     sprite.position.set(x, y);
//     sprite.eventMode = "none";
//     return sprite;
// }
//
// const SAFE_CHARACTERS = ["frodo", "merry", "pippin", "sam"] as const;
// const FALLBACK_SAFE_CHARACTER: BonusGameCharacterName = "frodo";
// const CHARACTER_DESIGN_WIDTH = 535;
// const CHARACTER_DESIGN_HEIGHT = 402;
// const MAX_SAFE_SPOTS = 4;
// const WIN_AMOUNT_FONT_SIZE = 60;
// const WIN_AMOUNT_ANIMATION_MS = 560;
// const WIN_AMOUNT_FRAME_MS = 1000 / 30;
// const WIN_AMOUNT_POP_MS = 240;
// const WIN_AMOUNT_OFFSET_Y = 20;
// const COUNTDOWN_DURATION_MS = 10_000;
// const HEADER_TEXT_RESOLUTION = 1.4;
// const WIN_POPUP_DELAY_MS = 2_000;
//
// function createWinAmount() {
//     const container = new Container({
//         label: "SafeWinAmount",
//         alpha: 0,
//         scale: 0.65,
//         eventMode: "none",
//         zIndex: 3,
//     });
//     const text = createText({
//         fontFamily: FONT_FAMILY.EB_GARAMOND,
//         fontWeight: "700",
//         fontSize: WIN_AMOUNT_FONT_SIZE,
//         letterSpacing: 1.44,
//         fill: new FillGradient({
//             type: "linear",
//             start: { x: 0, y: 0 },
//             end: { x: 0, y: 1 },
//             colorStops: [
//                 { offset: 0, color: "#fff5af" },
//                 { offset: 0.25, color: "#fcec96" },
//                 { offset: 0.5, color: "#f1cc68" },
//                 { offset: 0.75, color: "#e6ad37" },
//                 { offset: 1, color: "#e29f1b" },
//             ],
//         }),
//         stroke: { color: "#3c1700", width: 5 },
//         dropShadow: {
//             color: "#3c1700",
//             alpha: 0.85,
//             blur: 5,
//             distance: 3,
//             angle: Math.PI / 2,
//         },
//         text: "+0",
//     });
//     text.anchor.set(0.5);
//     container.addChild(text);
//     return { container, text };
// }
//
// function createHeader() {
//     const header = new Container({ label: "BonusHeader" });
//     const left = createSprite("bonus_header_left.png", 365, 58);
//     const right = createSprite("bonus_header_right.png", 1266, 58);
//     const title = createText({
//         text: i18n.t("bonusGame.chooseHiding"),
//         fontFamily: FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//         fontSize: 80,
//         fontWeight: "600",
//         fill: 0xffffff,
//     });
//     applyInfoTitleStyle(title, 80, false);
//     title.label = "BonusHeaderTitle";
//     title.eventMode = "none";
//     title.resolution = HEADER_TEXT_RESOLUTION;
//     title.anchor.set(0.5);
//     title.position.set(960, 70);
//     const description = createText({
//         text: i18n.t("bonusGame.hidingDescription"),
//         fill: 0xfff0b0,
//         fontFamily: FONT_FAMILY.EB_GARAMOND,
//         fontSize: 32,
//         fontWeight: "600",
//         lineHeight: 32,
//         wordWrap: true,
//         wordWrapWidth: 900,
//         dropShadow: {
//             alpha: 1,
//             angle: Math.PI / 2,
//             blur: 4,
//             color: 0x000000,
//             distance: 4,
//         },
//     });
//     description.label = "BonusHeaderDescription";
//     description.anchor.set(0.5, 0);
//     description.position.set(960, 120);
//     const countdown = createText({
//         text: "10",
//         fontFamily: FONT_FAMILY.EB_GARAMOND,
//         fontSize: 120,
//         fontWeight: "normal",
//         fill: 0xffffff,
//     });
//     applyInfoTitleStyle(countdown, 120, false);
//     countdown.label = "BonusHeaderCountdown";
//     countdown.eventMode = "none";
//     countdown.resolution = HEADER_TEXT_RESOLUTION;
//     countdown.anchor.set(0.5, 0);
//     countdown.position.set(960, 160);
//     header.addChild(left, right, title, description, countdown);
//     return { container: header, left, right, title, description, countdown };
// }
//
// export function createHobbitsHidingBonusGame(
//     onLose?: (totalWin: number) => void,
//     onWin?: (totalWin: number) => void,
// ): HobbitsHidingBonusGame {
//     const bonusGame = new Container({
//         label: "HobbitsHidingBonusGame",
//         sortableChildren: true,
//     }) as HobbitsHidingBonusGame;
//
//     const nazgul = new BonusGameNazgulAnim();
//     nazgul.position.set(828, 110);
//     nazgul.zIndex = 0;
//     bonusGame.addChild(nazgul);
//
//     const pointerOverlay = new Container({
//         label: "BonusPointerOverlay",
//         eventMode: "none",
//         zIndex: 50,
//     });
//     bonusGame.addChild(pointerOverlay);
//
//     const header = createHeader();
//     header.container.zIndex = 200;
//     bonusGame.addChild(header.container);
//
//     let waiting = false;
//     let ended = false;
//     let pendingSpot: number | undefined;
//     let onComplete: (() => void) | undefined;
//     let countdownDeadline: number | undefined;
//     let winPopupTimer: ReturnType<typeof setTimeout> | undefined;
//     let displayedCountdown = 10;
//     const selected = new Set<number>();
//     const safe = new Set<number>();
//     const appearedSafeCharacters = new Set<BonusGameCharacterName>();
//     type HidingSpot = {
//         button: Container;
//         character: BonusGameCharacterAnim;
//         missEffect: BonusGameMissEffect;
//         pointer: Sprite;
//         cover: Sprite;
//         winAmount: ReturnType<typeof createWinAmount>;
//         winAmountAnimation?: NumberAnimation;
//         winAmountStartedAt?: number;
//         coverTextures: {
//             default: Texture;
//             highlighted?: Texture;
//             pressed?: Texture;
//         };
//         hovered: boolean;
//         pressed: boolean;
//     };
//     const spots: HidingSpot[] = [];
//
//     const stopCountdown = () => {
//         countdownDeadline = undefined;
//     };
//
//     const clearWinPopupTimer = () => {
//         if (winPopupTimer === undefined) return;
//         clearTimeout(winPopupTimer);
//         winPopupTimer = undefined;
//     };
//
//     const startCountdown = () => {
//         displayedCountdown = COUNTDOWN_DURATION_MS / 1000;
//         header.countdown.text = String(displayedCountdown);
//         header.countdown.visible = !ended;
//         countdownDeadline = ended
//             ? undefined
//             : performance.now() + COUNTDOWN_DURATION_MS;
//     };
//
//     const getRandomUnseenSafeCharacter = () => {
//         const unseenCharacters = SAFE_CHARACTERS.filter(
//             (characterName) => !appearedSafeCharacters.has(characterName),
//         );
//         const characterName =
//             unseenCharacters[
//                 Math.floor(Math.random() * unseenCharacters.length)
//             ] ?? FALLBACK_SAFE_CHARACTER;
//         appearedSafeCharacters.add(characterName);
//         return characterName;
//     };
//
//     const updateCoverTexture = (spot: HidingSpot) => {
//         spot.cover.texture =
//             (spot.pressed && spot.coverTextures.pressed) ||
//             (spot.hovered && spot.coverTextures.highlighted) ||
//             spot.coverTextures.default;
//     };
//
//     const updateCharacterVisibility = (spotIndex: number) => {
//         const spot = spots[spotIndex];
//         if (!spot) return;
//         const isVisible = safe.has(spotIndex);
//         spot.character.visible = isVisible;
//         spot.character.setActive(isVisible);
//         spot.pointer.visible =
//             !selected.has(spotIndex) &&
//             pendingSpot !== spotIndex &&
//             !spot.character.visible;
//     };
//
//     const setSpotEnabled = (
//         spot: HidingSpot,
//         enabled: boolean,
//         keepFullAlpha = false,
//     ) => {
//         spot.button.eventMode = enabled ? "static" : "none";
//         spot.button.cursor = enabled ? "pointer" : "default";
//         spot.button.alpha = enabled || keepFullAlpha ? 1 : 0.65;
//         if (!enabled) {
//             spot.hovered = false;
//             spot.pressed = false;
//             updateCoverTexture(spot);
//         }
//     };
//
//     const selectSpot = (spotIndex: number) => {
//         const spot = spots[spotIndex];
//         if (!spot || waiting || ended || selected.has(spotIndex)) return;
//
//         stopCountdown();
//         waiting = true;
//         pendingSpot = spotIndex;
//         updateCharacterVisibility(spotIndex);
//         setSpotEnabled(spot, false);
//         if (!gameRequests.PickHidingSpot(spotIndex)) {
//             waiting = false;
//             pendingSpot = undefined;
//             updateCharacterVisibility(spotIndex);
//             setSpotEnabled(spot, true);
//             startCountdown();
//         }
//     };
//
//     BONUS_GAME_LAYOUTS.landscape.spots.forEach((layout, spotIndex) => {
//         const button = new Container({
//             label: `HidingSpot-${spotIndex + 1}`,
//             sortableChildren: true,
//             eventMode: "static",
//             cursor: "pointer",
//             zIndex: layout.zIndex,
//         });
//         button.hitArea = createCharacterHitArea(
//             layout.characterPosition,
//             layout.characterScale,
//         );
//
//         const character = new BonusGameCharacterAnim();
//         character.position.set(...layout.characterPosition);
//         character.scale.set(layout.characterScale);
//         character.zIndex = 1;
//         character.visible = false;
//         const missEffect = new BonusGameMissEffect();
//         missEffect.position.set(
//             layout.characterPosition[0] +
//                 ((CHARACTER_DESIGN_WIDTH - missEffect.designWidth) / 2) *
//                     layout.characterScale,
//             layout.characterPosition[1] +
//                 ((CHARACTER_DESIGN_HEIGHT - missEffect.designHeight) / 2) *
//                     layout.characterScale,
//         );
//         missEffect.scale.set(layout.characterScale);
//         missEffect.zIndex = 3;
//         const pointer = createSprite(
//             "bonus_pointer.png",
//             ...layout.pointerPosition,
//         );
//         pointer.zIndex = 2;
//         const cover = createSprite(
//             layout.coverTexture,
//             ...layout.coverPosition,
//         );
//         cover.zIndex = 0;
//         const winAmount = createWinAmount();
//         winAmount.container.position.set(
//             character.x + (CHARACTER_DESIGN_WIDTH * character.scale.x) / 2,
//             character.y - WIN_AMOUNT_OFFSET_Y,
//         );
//         winAmount.container.visible = false;
//
//         const spot: HidingSpot = {
//             button,
//             character,
//             missEffect,
//             pointer,
//             cover,
//             winAmount,
//             coverTextures: {
//                 default: cover.texture,
//                 highlighted: getOptionalBonusTexture(
//                     getCoverStateTextureName(
//                         layout.coverTexture,
//                         "highlighted",
//                     ),
//                 ),
//                 pressed: getOptionalBonusTexture(
//                     getCoverStateTextureName(layout.coverTexture, "pressed"),
//                 ),
//             },
//             hovered: false,
//             pressed: false,
//         };
//         button.addChild(character, cover, winAmount.container, missEffect);
//         pointerOverlay.addChild(pointer);
//         button.on("pointerover", () => {
//             spot.hovered = true;
//             updateCoverTexture(spot);
//         });
//         button.on("pointerout", () => {
//             spot.hovered = false;
//             spot.pressed = false;
//             updateCoverTexture(spot);
//         });
//         button.on("pointerdown", () => {
//             spot.pressed = true;
//             updateCoverTexture(spot);
//         });
//         button.on("pointerup", () => {
//             spot.pressed = false;
//             updateCoverTexture(spot);
//         });
//         button.on("pointerupoutside", () => {
//             spot.hovered = false;
//             spot.pressed = false;
//             updateCoverTexture(spot);
//         });
//         button.on("pointercancel", () => {
//             spot.hovered = false;
//             spot.pressed = false;
//             updateCoverTexture(spot);
//         });
//         button.on("pointertap", () => {
//             selectSpot(spotIndex);
//         });
//         spots.push(spot);
//         bonusGame.addChild(button);
//     });
//
//     bonusGame.setLayout = (mode) => {
//         const layout = BONUS_GAME_LAYOUTS[mode];
//         nazgul.position.set(...layout.nazgulPosition);
//         layout.spots.forEach((spotLayout, index) => {
//             const spot = spots[index];
//             if (!spot) return;
//             spot.button.zIndex = spotLayout.zIndex;
//             spot.button.hitArea = createCharacterHitArea(
//                 spotLayout.characterPosition,
//                 spotLayout.characterScale,
//             );
//             spot.character.position.set(...spotLayout.characterPosition);
//             spot.character.scale.set(spotLayout.characterScale);
//             spot.missEffect.position.set(
//                 spotLayout.characterPosition[0] +
//                     ((CHARACTER_DESIGN_WIDTH - spot.missEffect.designWidth) /
//                         2) *
//                         spotLayout.characterScale,
//                 spotLayout.characterPosition[1] +
//                     ((CHARACTER_DESIGN_HEIGHT - spot.missEffect.designHeight) /
//                         2) *
//                         spotLayout.characterScale,
//             );
//             spot.missEffect.scale.set(spotLayout.characterScale);
//             spot.winAmount.container.position.set(
//                 spot.character.x +
//                     (CHARACTER_DESIGN_WIDTH * spot.character.scale.x) / 2,
//                 spot.character.y - WIN_AMOUNT_OFFSET_Y,
//             );
//             spot.pointer.position.set(...spotLayout.pointerPosition);
//             spot.cover.position.set(...spotLayout.coverPosition);
//         });
//         header.left.position.set(...layout.header.leftPosition);
//         header.right.position.set(...layout.header.rightPosition);
//         header.title.position.set(...layout.header.titlePosition);
//         header.title.style.fontSize = layout.header.titleFontSize;
//         header.description.position.set(
//             layout.header.titlePosition[0],
//             layout.header.titlePosition[1] + 50,
//         );
//         header.countdown.position.set(
//             layout.header.titlePosition[0],
//             header.description.y + header.description.height + 8,
//         );
//     };
//     bonusGame.setLayout("landscape");
//
//     const applyState = (data: ResponseMiniGameType) => {
//         if (ended) return;
//         waiting = false;
//         pendingSpot = undefined;
//         const wasCurrentSpotSafe = safe.has(data.spot);
//
//         const revealSafeSpot = (spotIndex: number) => {
//             if (safe.has(spotIndex)) return;
//             safe.add(spotIndex);
//             const spot = spots[spotIndex];
//             if (spot) {
//                 const characterName = getRandomUnseenSafeCharacter();
//                 spot.character.setCharacter(characterName);
//                 spot.winAmount.container.x =
//                     spot.character.x +
//                     (CHARACTER_DESIGN_WIDTH * spot.character.scale.x) / 2;
//             }
//         };
//
//         const showWinAmount = (
//             spotIndex: number,
//             prize?: number,
//             scatterMultiplier = 1,
//         ) => {
//             const spot = spots[spotIndex];
//             if (!spot || spot.winAmount.container.visible) return;
//
//             const winAmount = Math.max(
//                 0,
//                 gameEngine.GetTotalBet() *
//                     Math.max(0, prize ?? 0) *
//                     Math.max(0, scatterMultiplier),
//             );
//             spot.winAmount.container.visible = true;
//             spot.winAmount.container.alpha = 0;
//             spot.winAmount.container.scale.set(0.65);
//             spot.winAmountStartedAt = performance.now();
//             spot.winAmountAnimation?.stop();
//             spot.winAmountAnimation = animateNumber({
//                 from: 0,
//                 to: winAmount,
//                 durationMs: WIN_AMOUNT_ANIMATION_MS,
//                 frameMs: WIN_AMOUNT_FRAME_MS,
//                 onUpdate: (amount) => {
//                     spot.winAmount.text.text = `+${format(amount, 0)}`;
//                 },
//             });
//         };
//
//         data.spots?.forEach((spotState, spotIndex) => {
//             if (!spotState.opened) return;
//             selected.add(spotIndex);
//             if (spotState.kind === "safe") {
//                 revealSafeSpot(spotIndex);
//                 showWinAmount(spotIndex, spotState.prize, data.scatter_mult);
//             }
//         });
//         selected.add(data.spot);
//         if (data.kind === "safe") {
//             revealSafeSpot(data.spot);
//             showWinAmount(data.spot, data.prize, data.scatter_mult);
//             if (!wasCurrentSpotSafe) void audioSystem.play("sfx_safe");
//         }
//         const won = data.kind === "safe" && safe.size >= MAX_SAFE_SPOTS;
//         ended = data.ended || won;
//         if (ended) {
//             stopCountdown();
//             header.countdown.visible = false;
//         } else {
//             startCountdown();
//         }
//         const lost = data.ended === true && data.kind === "ringwraith";
//         spots.forEach((spot, index) => {
//             updateCharacterVisibility(index);
//             setSpotEnabled(
//                 spot,
//                 !ended && !selected.has(index),
//                 safe.has(index) || (lost && data.spot === index),
//             );
//         });
//         if (lost) {
//             const spot = spots[data.spot];
//             const totalWin = data.total_win ?? 0;
//             if (spot) {
//                 void audioSystem.play("sfx_fail", { singleInstance: true });
//                 spot.missEffect.play(() => onLose?.(totalWin));
//             } else onLose?.(totalWin);
//         } else if (won) {
//             clearWinPopupTimer();
//             winPopupTimer = setTimeout(() => {
//                 winPopupTimer = undefined;
//                 onWin?.(data.total_win ?? 0);
//             }, WIN_POPUP_DELAY_MS);
//             onComplete = undefined;
//         } else if (ended) {
//             onComplete?.();
//             onComplete = undefined;
//         }
//     };
//
//     const removeUpdate = eventBus.on(EVENT_NAMES.MINIGAME_UPDATED, applyState);
//     const removeEnd = eventBus.on(EVENT_NAMES.MINIGAME_ENDED, applyState);
//     bonusGame.start = (state = {}, completed) => {
//         clearWinPopupTimer();
//         selected.clear();
//         safe.clear();
//         appearedSafeCharacters.clear();
//         waiting = false;
//         pendingSpot = undefined;
//         ended = state.ended ?? false;
//         onComplete = completed;
//         startCountdown();
//         spots.forEach((spot, index) => {
//             spot.missEffect.stop();
//             spot.winAmountAnimation?.stop();
//             spot.winAmountAnimation = undefined;
//             spot.winAmountStartedAt = undefined;
//             spot.winAmount.container.visible = false;
//             spot.winAmount.text.text = "+0";
//             spot.hovered = false;
//             spot.pressed = false;
//             updateCoverTexture(spot);
//             updateCharacterVisibility(index);
//             setSpotEnabled(spot, !ended && !selected.has(index));
//         });
//         if (ended) {
//             onComplete?.();
//             onComplete = undefined;
//         }
//     };
//     bonusGame.on("destroyed", () => {
//         stopCountdown();
//         clearWinPopupTimer();
//         spots.forEach((spot) => spot.winAmountAnimation?.stop());
//         removeUpdate();
//         removeEnd();
//     });
//     bonusGame.onRender = () => {
//         if (!waiting && !ended && countdownDeadline !== undefined) {
//             const remainingMs = Math.max(
//                 0,
//                 countdownDeadline - performance.now(),
//             );
//             const remainingSeconds = Math.ceil(remainingMs / 1000);
//             if (remainingSeconds !== displayedCountdown) {
//                 displayedCountdown = remainingSeconds;
//                 header.countdown.text = String(remainingSeconds);
//             }
//             if (remainingMs === 0) {
//                 stopCountdown();
//                 const availableSpotIndexes = spots.flatMap((_, index) =>
//                     selected.has(index) ? [] : [index],
//                 );
//                 const randomSpotIndex =
//                     availableSpotIndexes[
//                         Math.floor(Math.random() * availableSpotIndexes.length)
//                     ];
//                 if (randomSpotIndex !== undefined) {
//                     selectSpot(randomSpotIndex);
//                 }
//             }
//         }
//         spots.forEach((spot) => {
//             if (
//                 !spot.winAmount.container.visible ||
//                 spot.winAmountStartedAt === undefined
//             ) {
//                 return;
//             }
//             const elapsed = performance.now() - spot.winAmountStartedAt;
//             const entranceProgress = Math.min(1, elapsed / WIN_AMOUNT_POP_MS);
//             const easedEntrance = 1 - Math.pow(1 - entranceProgress, 3);
//             const settlePulse =
//                 entranceProgress >= 1
//                     ? Math.sin(elapsed / 170) * 0.035
//                     : Math.sin(entranceProgress * Math.PI) * 0.16;
//
//             spot.winAmount.container.alpha = easedEntrance;
//             spot.winAmount.container.scale.set(
//                 0.65 + easedEntrance * 0.35 + settlePulse,
//             );
//         });
//     };
//     return bonusGame;
// }
