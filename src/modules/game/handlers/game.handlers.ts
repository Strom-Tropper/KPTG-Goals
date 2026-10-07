/* eslint-disable @typescript-eslint/no-explicit-any */
import { socketClient } from "../ws/game.ws";
import { gameEngine } from "../engine/game.engine";
import { EVENT_NAMES, eventBus } from "../engine/game.events";
import {
    RES_BALANCE_UPDATE,
    RES_BET_HISTORY,
    RES_ERROR,
    RES_FIRST_LOAD,
    RES_JACKPOT_HISTORY,
    RES_JACKPOT_VALUES,
    RES_MAIN_BALANCE_UPDATE,
    RES_MINIGAME,
    RES_SPIN,
} from "../engine/game.constants";

const RECONNECT_AUTO_SPIN_RESUME_DELAY_MS = 300;

export function InitGameHandlers(): void {
    let resumeAutoSpinAfterReconnect:
        | { isAutoSpin: true; remaining: number }
        | undefined;
    let resumeAutoSpinTimer: ReturnType<typeof setTimeout> | undefined;
    let resumeAutoSpinToken = 0;

    eventBus.on(EVENT_NAMES.SPIN_CANCELLED, () => {
        resumeAutoSpinAfterReconnect = undefined;
        resumeAutoSpinToken += 1;
        if (resumeAutoSpinTimer !== undefined) {
            clearTimeout(resumeAutoSpinTimer);
            resumeAutoSpinTimer = undefined;
        }
        gameEngine.SetAutoSpin(false);
        gameEngine.SetAutoSpinRemaining(0);
        gameEngine.SetSpinning(false);
    });

    eventBus.on(EVENT_NAMES.SOCKET_CONNECTED, (data: unknown) => {
        const isReconnect =
            typeof data === "object" &&
            data !== null &&
            "isReconnect" in data &&
            data.isReconnect === true;

        resumeAutoSpinAfterReconnect =
            isReconnect && gameEngine.IsAutoSpin()
                ? {
                      isAutoSpin: true,
                      remaining: gameEngine.GetAutoSpinRemaining(),
                  }
                : undefined;
    });

    socketClient.on(RES_FIRST_LOAD, (data: any) => {
        const autoSpinToResume = resumeAutoSpinAfterReconnect;
        resumeAutoSpinAfterReconnect = undefined;
        resumeAutoSpinToken += 1;

        if (resumeAutoSpinTimer) {
            clearTimeout(resumeAutoSpinTimer);
            resumeAutoSpinTimer = undefined;
        }

        gameEngine.handleInitialLoadResponse(data);

        if (autoSpinToResume) {
            const resumeToken = resumeAutoSpinToken;

            gameEngine.SetAutoSpinRemaining(autoSpinToResume.remaining);
            resumeAutoSpinTimer = setTimeout(() => {
                resumeAutoSpinTimer = undefined;

                if (resumeToken !== resumeAutoSpinToken) return;

                gameEngine.SetAutoSpin(autoSpinToResume.isAutoSpin);
            }, RECONNECT_AUTO_SPIN_RESUME_DELAY_MS);
        }
    });

    socketClient.on(RES_SPIN, (data: any) => {
        gameEngine.handleSpinResponse(data);
    });

    socketClient.on(RES_MINIGAME, (data: any) => {
        gameEngine.handleMiniGameResponse(data);
    });

    socketClient.on(RES_MAIN_BALANCE_UPDATE, (data: any) => {
        gameEngine.handleBalanceUpdateResponse({
            ...data,
            wallet_key: "main",
        });
    });

    socketClient.on(RES_JACKPOT_VALUES, (data: any) => {
        gameEngine.handleJackpotValuesResponse({
            ...data,
            c: RES_JACKPOT_VALUES,
        });
    });

    socketClient.on(RES_BALANCE_UPDATE, (data: any) => {
        gameEngine.handleBalanceUpdateResponse(data);
    });

    socketClient.on(RES_BET_HISTORY, (data: any) => {
        eventBus.emit(EVENT_NAMES.BETTING_HISTORY_RESPONSE, data);
    });

    socketClient.on(RES_JACKPOT_HISTORY, (data: any) => {
        eventBus.emit(EVENT_NAMES.JACKPOT_HISTORY_RESPONSE, data);
    });

    socketClient.on(RES_ERROR, (data: any) => {
        gameEngine.handleErrorResponse(
            data as { errc?: string | number; error?: string },
        );
    });
}
