// import { type Ticker } from "pixi.js";
// import Popup from "@/components/base/Popup";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import { BonusGameLoseAnim } from "@/animations/BonusGameLoseAnim";
// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import { i18n } from "@/shared/i18n/I18nManager";
//
// const AUTO_CLOSE_MS = 6000;
// const POPUP_SKIP_HOLD_MS = 1000;
//
// /** Loss artwork laid out in the mockup's 1920 × 1080 coordinate space. */
// export class BonusGameLosePopup extends Popup {
//     private onClosed?: () => void;
//     private closing = false;
//     private isSkipRequested = false;
//     private autoCloseTimer?: ReturnType<typeof setTimeout>;
//     private readonly loseAnimation: BonusGameLoseAnim;
//
//     constructor(ticker: Ticker) {
//         super({
//             ticker,
//             overlayAlpha: 0.7,
//             closeOnOverlay: false,
//             targetScale: 1.2,
//         });
//         this.label = "BonusGameLosePopup";
//
//         const loseAnimation = new BonusGameLoseAnim();
//         this.loseAnimation = loseAnimation;
//         this.content.addChild(loseAnimation);
//
//         const title = createText({
//             text: i18n.t("bonusGame.ringWraithGotYou"),
//             fontFamily: FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//             fontSize: 46,
//             fill: 0xff0000,
//             dropShadow: {
//                 color: 0x000000,
//                 alpha: 1,
//                 blur: 2,
//                 distance: 3,
//             },
//         });
//         title.anchor.set(0.5);
//         title.position.set(0, 280);
//         this.content.addChild(title);
//     }
//
//     showLoss(onClosed?: () => void) {
//         if (this.destroyed || this.isVisible()) return;
//         this.onClosed = onClosed;
//         this.closing = false;
//         this.isSkipRequested = false;
//         this.loseAnimation.play();
//         this.show();
//         this.addSkipListener();
//         eventBus.emit(EVENT_NAMES.AUDIO_BONUS_LOSE_POPUP_SHOWN, null);
//         this.autoCloseTimer = setTimeout(() => this.hide(), AUTO_CLOSE_MS);
//     }
//
//     override hide(options: Parameters<Popup["hide"]>[0] = {}) {
//         if (this.closing || !this.isVisible()) return;
//         this.closing = true;
//         this.clearAutoCloseTimer();
//         this.removeSkipListener();
//         this.loseAnimation.stop();
//         super.hide({
//             ...options,
//             callback: () => {
//                 const onClosed = this.onClosed;
//                 this.onClosed = undefined;
//                 this.closing = false;
//                 options.callback?.();
//                 onClosed?.();
//             },
//         });
//     }
//
//     override destroy(options?: Parameters<Popup["destroy"]>[0]) {
//         if (this.destroyed) return;
//         this.clearAutoCloseTimer();
//         this.removeSkipListener();
//         this.loseAnimation.stop();
//         this.onClosed = undefined;
//         super.destroy(options);
//     }
//
//     private readonly requestSkip = () => {
//         if (!this.isVisible() || this.closing || this.isSkipRequested) return;
//
//         this.isSkipRequested = true;
//         this.clearAutoCloseTimer();
//         this.autoCloseTimer = setTimeout(() => this.hide(), POPUP_SKIP_HOLD_MS);
//     };
//
//     private readonly handlePointerDown = () => this.requestSkip();
//
//     private readonly handleSkipKeyDown = (event: KeyboardEvent) => {
//         if (event.code !== "Space") return;
//         event.preventDefault();
//         this.requestSkip();
//     };
//
//     private addSkipListener() {
//         window.addEventListener("pointerdown", this.handlePointerDown);
//         window.addEventListener("keydown", this.handleSkipKeyDown);
//     }
//
//     private removeSkipListener() {
//         window.removeEventListener("pointerdown", this.handlePointerDown);
//         window.removeEventListener("keydown", this.handleSkipKeyDown);
//     }
//
//     private clearAutoCloseTimer() {
//         if (this.autoCloseTimer === undefined) return;
//         clearTimeout(this.autoCloseTimer);
//         this.autoCloseTimer = undefined;
//     }
// }
