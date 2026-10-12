// import { BitmapText, type Ticker } from "pixi.js";
// import Popup from "@/components/base/Popup";
// import { format } from "@/shared/utils/formatNumber";
// import {
//     animateNumber,
//     type NumberAnimation,
// } from "@/shared/utils/animateNumber";
// import {
//     createBlinkAnimation,
//     type BlinkAnimation,
// } from "@/shared/utils/createBlinkAnimation";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import { BonusGameWinAnim } from "@/animations/BonusGameWinAnim";
//
// const AMOUNT_ANIMATION_MS = 1700;
// const POPUP_DURATION_MS = 10000;
// const POPUP_SKIP_HOLD_MS = 2000;
// const AMOUNT_SCALE_PULSE = 0.04;
//
// /** Bonus win artwork laid out in the mockup's 1920 × 1080 coordinate space. */
// export class BonusGameWinPopup extends Popup {
//     private onClosed?: () => void;
//     private closing = false;
//     private isSkipRequested = false;
//     private totalWin = 0;
//     private amountAnimation: NumberAnimation | null = null;
//     private autoCloseTimer?: ReturnType<typeof setTimeout>;
//     private readonly amountPulse: BlinkAnimation;
//     private readonly amountTicker: Ticker;
//     private readonly amount = new BitmapText({
//         style: {
//             fontFamily: "Win Amount Font",
//             fontSize: 90,
//             align: "center",
//         },
//     });
//     private readonly winAnimation: BonusGameWinAnim;
//
//     constructor(ticker: Ticker) {
//         super({ ticker, overlayAlpha: 0.7, closeOnOverlay: false });
//         this.label = "BonusGameWinPopup";
//         this.amountTicker = ticker;
//         this.amountPulse = createBlinkAnimation({
//             target: this.amount,
//             ticker,
//             scalePulse: AMOUNT_SCALE_PULSE,
//             minAlpha: 1,
//         });
//
//         const winAnimation = new BonusGameWinAnim();
//         this.winAnimation = winAnimation;
//         winAnimation.position.set(-755, -435);
//         this.amount.anchor.set(0.5);
//         const winPanelCenter = winAnimation.getWinPanelCenter();
//         this.amount.position.set(
//             winAnimation.x + winPanelCenter.x + 8,
//             winAnimation.y + winPanelCenter.y - 10,
//         );
//         this.content.addChild(winAnimation, this.amount);
//     }
//
//     showWin(totalWin: number, onClosed?: () => void) {
//         if (this.destroyed || this.isVisible()) return;
//         this.stopAmountAnimation();
//         this.updateAmount(0);
//         this.totalWin = totalWin;
//         this.onClosed = onClosed;
//         this.closing = false;
//         this.isSkipRequested = false;
//         this.winAnimation.play();
//         this.show();
//         this.addSkipListener();
//         eventBus.emit(EVENT_NAMES.AUDIO_BONUS_WIN_POPUP_SHOWN, null);
//         this.autoCloseTimer = setTimeout(() => this.hide(), POPUP_DURATION_MS);
//         this.amountAnimation = animateNumber({
//             from: 0,
//             to: totalWin,
//             durationMs: AMOUNT_ANIMATION_MS,
//             frameMs: 1000 / 40,
//             ticker: this.amountTicker,
//             onUpdate: (value) => this.updateAmount(value),
//             onComplete: () => {
//                 this.amountAnimation = null;
//                 this.amountPulse.start();
//             },
//         });
//     }
//
//     override hide(options: Parameters<Popup["hide"]>[0] = {}) {
//         if (this.closing || !this.isVisible()) return;
//         this.closing = true;
//         this.clearAutoCloseTimer();
//         this.removeSkipListener();
//         this.stopAmountAnimation();
//         this.winAnimation.stop();
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
//         this.stopAmountAnimation();
//         this.winAnimation.stop();
//         this.onClosed = undefined;
//         super.destroy(options);
//     }
//
//     private updateAmount(value: number) {
//         this.amount.text = format(value);
//         this.amount.scale.set(1);
//         // Reserve room for the pulse so large amounts stay inside the panel.
//         this.amountPulse.setBaseScale(this.amount.scale.x);
//     }
//
//     private stopAmountAnimation() {
//         this.amountAnimation?.stop();
//         this.amountAnimation = null;
//         this.amountPulse.stop();
//     }
//
//     private readonly requestSkip = () => {
//         if (!this.isVisible() || this.closing || this.isSkipRequested) return;
//
//         this.isSkipRequested = true;
//         this.stopAmountAnimation();
//         this.updateAmount(this.totalWin);
//         this.amountPulse.start();
//         this.clearAutoCloseTimer();
//         this.autoCloseTimer = setTimeout(() => this.hide(), POPUP_SKIP_HOLD_MS);
//     };
//
//     private addSkipListener() {
//         window.addEventListener("pointerdown", this.requestSkip);
//     }
//
//     private removeSkipListener() {
//         window.removeEventListener("pointerdown", this.requestSkip);
//     }
//
//     private clearAutoCloseTimer() {
//         if (this.autoCloseTimer === undefined) return;
//         clearTimeout(this.autoCloseTimer);
//         this.autoCloseTimer = undefined;
//     }
// }
