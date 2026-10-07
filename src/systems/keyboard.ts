import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
import Popup from "@/components/base/Popup";
import { gameEngine } from "@/modules/game/engine/game.engine";

let isLocked = false;
const AUTO_SPIN_HOLD_DURATION_MS = 500;

type KeyboardSystemOptions = {
    focusTarget?: HTMLElement | null;
    showInfo?: () => void;
    showSettings?: () => void;
    toggleMusic?: () => void;
    toggleSound?: () => void;
};

function lock() {
    isLocked = true;
    setTimeout(() => (isLocked = false), 100);
}

function isEditableTarget(target: EventTarget | null) {
    const el = target as HTMLElement;
    if (!el) return false;

    return (
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable
    );
}

function focusGameTarget(target?: HTMLElement | null) {
    if (!target || isEditableTarget(document.activeElement)) return;

    target.focus({ preventScroll: true });
}

function prepareFocusTarget(target?: HTMLElement | null) {
    if (!target) return () => {};

    const previousTabIndex = target.getAttribute("tabindex");

    if (previousTabIndex === null) {
        target.tabIndex = -1;
    }

    focusGameTarget(target);

    const handlePointerDown = () => focusGameTarget(target);
    const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
            focusGameTarget(target);
        }
    };

    target.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pageshow", handlePointerDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
        target.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pageshow", handlePointerDown);
        document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
        );

        if (previousTabIndex === null) {
            target.removeAttribute("tabindex");
            return;
        }

        target.setAttribute("tabindex", previousTabIndex);
    };
}

export function createKeyboardSystem(options: KeyboardSystemOptions = {}) {
    const cleanupFocusTarget = prepareFocusTarget(options.focusTarget);
    let spaceHoldTimer: ReturnType<typeof setTimeout> | null = null;
    let isSpacePressed = false;

    const clearSpaceHoldTimer = () => {
        if (spaceHoldTimer === null) return;

        clearTimeout(spaceHoldTimer);
        spaceHoldTimer = null;
    };

    const releaseSpace = () => {
        isSpacePressed = false;
        clearSpaceHoldTimer();
    };

    function handleKeyDown(event: KeyboardEvent) {
        if (event.defaultPrevented) return;
        if (isEditableTarget(event.target)) return;

        if (!event.repeat && !isLocked && event.code === "KeyM") {
            options.toggleMusic?.();
            lock();
            return;
        }

        if (!event.repeat && !isLocked && event.code === "KeyS") {
            options.toggleSound?.();
            lock();
            return;
        }

        if (Popup.hasVisiblePopup()) return;

        if (event.code === "Space") {
            event.preventDefault();

            if (
                isLocked ||
                event.repeat ||
                isSpacePressed ||
                gameEngine.IsWalletSwitchLocked()
            ) {
                return;
            }

            isSpacePressed = true;
            eventBus.emit(EVENT_NAMES.SPIN_BUTTON_PRESSED, null);
            spaceHoldTimer = setTimeout(() => {
                spaceHoldTimer = null;
                if (
                    !isSpacePressed ||
                    Popup.hasVisiblePopup() ||
                    gameEngine.IsWalletSwitchLocked()
                ) {
                    return;
                }

                gameEngine.SetAutoSpinRemaining(Infinity);
                gameEngine.SetAutoSpin(true);
            }, AUTO_SPIN_HOLD_DURATION_MS);

            lock();
            return;
        }

        if (isLocked || event.repeat) return;

        switch (event.code) {
            case "Enter":
            case "NumpadEnter": {
                event.preventDefault();

                if (gameEngine.IsWalletSwitchLocked()) return;

                if (!gameEngine.IsFreeSpinActive()) {
                    gameEngine.ToggleAutoSpin();
                }
                lock();
                return;
            }

            case "ArrowRight": {
                event.preventDefault();

                if (gameEngine.IsSpinning()) return;

                eventBus.emit(EVENT_NAMES.BET_INCREASE_KEYBOARD, null);
                lock();
                return;
            }

            case "ArrowLeft": {
                event.preventDefault();

                if (gameEngine.IsSpinning()) return;

                eventBus.emit(EVENT_NAMES.BET_DECREASE_KEYBOARD, null);
                lock();
                return;
            }

            case "KeyT": {
                gameEngine.ToggleTurbo();
                lock();
                return;
            }

            case "KeyI": {
                options.showInfo?.();
                lock();
                return;
            }

            case "Escape": {
                event.preventDefault();
                options.showSettings?.();
                lock();
                return;
            }

            default:
                return;
        }
    }

    function handleKeyUp(event: KeyboardEvent) {
        if (event.code !== "Space") return;

        if (!isEditableTarget(event.target)) {
            event.preventDefault();
        }
        releaseSpace();
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    window.addEventListener("blur", releaseSpace);

    // cleanup
    return () => {
        window.removeEventListener("keydown", handleKeyDown, {
            capture: true,
        });
        window.removeEventListener("keyup", handleKeyUp, {
            capture: true,
        });
        window.removeEventListener("blur", releaseSpace);
        releaseSpace();
        cleanupFocusTarget();
    };
}
