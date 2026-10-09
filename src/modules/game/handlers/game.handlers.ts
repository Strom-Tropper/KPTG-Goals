/* eslint-disable @typescript-eslint/no-explicit-any */
import { socketClient } from "../ws/game.ws";
import { gameEngine } from "../engine/game.engine";
import { goalSession } from "../engine/game.session";
import {
    RES_BALANCE_UPDATE,
    RES_ERROR,
    RES_FIRST_LOAD,
    RES_MAIN_BALANCE_UPDATE,
    RES_SPIN,
    RES_STATE,
} from "../engine/game.constants";

export function InitGameHandlers(): void {
    // Slot: tự quay lại sau khi nối lại. Bàn Goal không gọi.
    // let resumeAutoSpinAfterReconnect:
    //     | { isAutoSpin: true; remaining: number }
    //     | undefined;
    // let resumeAutoSpinTimer: ReturnType<typeof setTimeout> | undefined;
    // let resumeAutoSpinToken = 0;
    //
    // eventBus.on(EVENT_NAMES.SPIN_CANCELLED, () => {
    //     resumeAutoSpinAfterReconnect = undefined;
    //     resumeAutoSpinToken += 1;
    //     if (resumeAutoSpinTimer !== undefined) {
    //         clearTimeout(resumeAutoSpinTimer);
    //         resumeAutoSpinTimer = undefined;
    //     }
    //     gameEngine.SetAutoSpin(false);
    //     gameEngine.SetAutoSpinRemaining(0);
    //     gameEngine.SetSpinning(false);
    // });
    //
    // eventBus.on(EVENT_NAMES.SOCKET_CONNECTED, (data: unknown) => {
    //     const isReconnect =
    //         typeof data === "object" &&
    //         data !== null &&
    //         "isReconnect" in data &&
    //         data.isReconnect === true;
    //
    //     resumeAutoSpinAfterReconnect =
    //         isReconnect && gameEngine.IsAutoSpin()
    //             ? {
    //                   isAutoSpin: true,
    //                   remaining: gameEngine.GetAutoSpinRemaining(),
    //               }
    //             : undefined;
    // });

    socketClient.on(RES_FIRST_LOAD, (data: any) => {
        gameEngine.handleInitialLoadResponse(data);
        goalSession.applyConnect(data);
    });

    // Slot đọc 101 như một vòng quay. Goal đọc cùng gói ở dưới.
    // socketClient.on(RES_SPIN, (data: any) => {
    //     gameEngine.handleSpinResponse(data);
    // });
    //
    // socketClient.on(RES_MINIGAME, (data: any) => {
    //     gameEngine.handleMiniGameResponse(data);
    // });
    //
    // socketClient.on(RES_JACKPOT_VALUES, (data: any) => {
    //     gameEngine.handleJackpotValuesResponse({
    //         ...data,
    //         c: RES_JACKPOT_VALUES,
    //     });
    // });
    //
    // socketClient.on(RES_JACKPOT_HISTORY, (data: any) => {
    //     eventBus.emit(EVENT_NAMES.JACKPOT_HISTORY_RESPONSE, data);
    // });
    //
    // socketClient.on(RES_BET_HISTORY, (data: any) => {
    //     eventBus.emit(EVENT_NAMES.BETTING_HISTORY_RESPONSE, data);
    // });

    socketClient.on(RES_MAIN_BALANCE_UPDATE, (data: any) => {
        gameEngine.handleBalanceUpdateResponse({
            ...data,
            wallet_key: "main",
        });
    });

    socketClient.on(RES_BALANCE_UPDATE, (data: any) => {
        gameEngine.handleBalanceUpdateResponse(data);
    });

    socketClient.on(RES_ERROR, (data: any) => {
        goalSession.applyError(data);
    });

    socketClient.on(RES_SPIN, (data: any) => {
        goalSession.applyFrame(data);
    });

    socketClient.on(RES_STATE, (data: any) => {
        goalSession.applySnapshot(data);
    });
}
