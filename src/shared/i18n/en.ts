import { GAME_ERROR_CODES } from "@/modules/game/engine/game.constants";

export const en = {
    actions: {
        confirm: "CONFIRM",
        reload: "RELOAD",
    },
    notification: {
        title: "NOTIFICATION",
    },
    loading: {
        progress: "LOADING {progress}%",
    },
    bonusGame: {
        chooseHiding: "CHOOSE YOUR HIDING",
        hidingDescription:
            "Help the Hobbits hide! Click hiding spots to find safe places and earn rewards. Find 4 safe spots—or get caught!",
        ringWraithGotYou: "THE RING WRAITH GOT YOU!",
    },
    adventureMap: {
        lothlorien: "Lothlórien",
        mountDoom: "Mount Doom",
        rivendell: "Rivendell",
    },
    freeSpinIntro: {
        subtitle: "THE FELLOWSHIP HAS REACHED",
        your: "YOUR",
        freeSpins: "FREE SPINS",
        await: "AWAIT!",
        continueLabel: "{destination}: {spins} free spins. Continue",
    },
    freeSpinTotalWin: {
        congratulation: "CONGRATULATION!",
        youHaveWon: "YOU HAVE WON",
        inFreeSpins: "IN {count} FREESPINS",
    },
    betHistory: {
        baseSpinResult: "Base Spin Result",
        bonusGameResult: "Bonus Game Result",
        copied: "Copied",
        empty: "No bet history found",
        freeSpinResult: "Freespin Result {current}/{total}",
        jackpotWin: "JACKPOT WIN",
        roundId: "ROUND ID",
        respinResult: "Respin Result",
        sarumanTriggerRespin: "Saruman - trigger Respin",
        time: "TIME",
        title: "BET HISTORY",
        totalBet: "TOTAL BET",
        totalWin: "TOTAL WIN",
        way: "Way",
        win: "Win",
    },
    jackpotHistory: {
        betLevel: "BET LEVEL",
        empty: "No jackpot history found",
        jpAmount: "JP AMOUNT",
        playerId: "PLAYER ID",
        time: "TIME",
        title: "JACKPOT HISTORY",
    },
    mainGame: {
        auto: "AUTO",
        balance: "BALANCE",
        betLevel: "BET LEVEL",
        freeSpinsLeft: "{count} Freespin Left",
        totalBet: "TOTAL BET",
        turbo: "TURBO",
        winAmount: "WIN AMOUNT",
    },
    goal: {
        balance: "Balance",
        betLevel: "Bet Level {level}",
        cashout: "CASHOUT",
        play: "PLAY",
        random: "RANDOM",
        resetBet: "Reset Bet",
        insufficientBalance: "Not enough balance",
        invalidState: "Choose a bet first",
        invalidSlot: "Pick an open cell",
    },
    settings: {
        music: "MUSIC",
        sound: "SOUND",
        title: "SETTINGS",
    },
    info: {
        landscape: {
            bonusGame: {
                title: "BONUS GAME",
                scatterDescription:
                    "Land Witch King SCATTERs to trigger BONUS\nGame. The number of SCATTERs determines\nyour multiplier for rewards.",
                instruction:
                    "Choose hiding spots one by one to help the Hobbits hide.",
                win: "SAFE",
                winDescription: "Win rewards",
                lose: "LOSE",
                loseDescription: "End BONUS game",
                scatterAwards:
                    "3 Scatters 1x Multiplier\n4 Scatters 2x Multiplier\n5 Scatters 5x Multiplier",
            },
            freespin: {
                title: "FREESPIN",
                mapDescription:
                    "After every winning spin, the\nFellowship moves further\nalong their quest.\nReaching specific waypoints\ntriggers the Free Spins feature.",
                rivendell:
                    "5 Free Spins. The reels are enriched\nwith extra Medium symbols.",
                lothlorien:
                    "10 Free Spins. The reels are enriched\nwith extra High symbols.",
                mountDoom:
                    "15 Free Spins. The One Ring\nbecomes a Sticky Wild for the\nduration.",
            },
            jackpot: {
                title: "JACKPOT",
                stickyRingsTitle: "STICKY RINGS",
                stickyRingsDescription:
                    "During these 15 Free Spins, every One Ring symbol that\nlands becomes a Sticky Wild, locking into place for the\nremainder of the round.",
                collectRings:
                    "Collect the Rings during the Free Spins and claim your\nreward based on how many you collect:\n<ringCount>3 Rings:</ringCount> <reward>100x</reward>\n<ringCount>6 Rings:</ringCount> <reward>150x</reward>\n<ringCount>9 Rings:</ringCount> <reward>GRAND JACKPOT!!!</reward>",
                note: "Other wild and scatter will not appear during the Mount Doom Free Spin",
            },
            lorePayout: {
                title: "LORE PAYOUT",
                instruction:
                    "Land the exact symbol combination in a single column to\ntrigger a specific storyline and earn an extra payout.",
                stories: {
                    burdenOfTheRing: "THE BURDEN OF THE RING",
                    threeHunters: "THE THREE HUNTERS",
                    knightInTheDark: "A KNIGHT IN THE DARK",
                    secondBreakfast: "SECOND BREAKFAST",
                    wizardsDuel: "THE WIZARDS' DUEL",
                },
            },
            paytable: {
                title: "PAYTABLE",
                matchDescription:
                    "LINE UP 3 MATCHING\nSYMBOLS IN THE SAME\nCOLUMN TO WIN",
            },
            wildScatter: {
                title: "WILD & SCATTER",
                conditionalWild:
                    "Conditional <wild>WILD</wild>. Substitutes for all Low value symbols.",
                wild: "<wild>WILD</wild>. Substitutes for all symbols except for scatter.",
                respinScatter:
                    "<strong>Respin</strong> <scatter>SCATTER</scatter>: Every time it lands, summon an Orc Uruk-Hai<br>that locks up to 6 high-value symbols in place, then triggers a Respin.<br>The Respin <scatter>SCATTER</scatter> cannot appear again for 10 spins.",
                bonusScatter:
                    "<scatter>SCATTER</scatter>. Land 3, 4, or 5 <scatter>SCATTERS</scatter> to trigger the BONUS<br>GAME.",
            },
        },
        portrait: {
            bonusGame: {
                title: "BONUS GAME",
                scatterDescription:
                    "Land Witch King SCATTERs to trigger BONUS\nGame. The number of SCATTERs determines\nyour multiplier for rewards.",
                instruction:
                    "Choose hiding spots one by one to help the\nHobbits hide.",
                win: "SAFE",
                winDescription: "Win rewards",
                lose: "LOSE",
                loseDescription: "End BONUS game",
                scatterAwards:
                    "3 Scatters    1x   Multiplier\n4 Scatters    2x   Multiplier\n5 Scatters    5x   Multiplier",
            },
            freespin: {
                title: "FREESPIN",
                mapDescription:
                    "After every winning spin, the Fellowship moves further\nalong their quest.\nReaching specific waypoints triggers the Free Spins feature.",
                rivendell:
                    "5 Free Spins. The reels are enriched\nwith extra Medium symbols.",
                lothlorien:
                    "10 Free Spins. The reels are enriched\nwith extra High symbols.",
                mountDoom:
                    "15 Free Spins. The One Ring\nbecomes a Sticky Wild for the\nduration.",
            },
            jackpot: {
                title: "JACKPOT",
                stickyRingsTitle: "STICKY RINGS",
                stickyRingsDescription:
                    "During these 15 Free Spins, every One Ring symbol that\nlands becomes a Sticky Wild, locking into place for the\nremainder of the round.",
                collectRings:
                    "Collect the Rings during the Free Spins and claim your\nreward based on how many you collect:\n<ringCount>3 Rings:</ringCount> <reward>100x</reward>\n<ringCount>6 Rings:</ringCount> <reward>150x</reward>\n<ringCount>9 Rings:</ringCount> <reward>GRAND JACKPOT!!!</reward>",
                note: "Note: Gollum, Saruman, and the Witch-king will not\nappear during the Mount Doom Free Spins.",
            },
            lorePayout: {
                title: "LORE PAYOUT",
                instruction:
                    "Land the exact symbol combination in a single column to\ntrigger a specific storyline and earn an extra payout.",
                stories: {
                    burdenOfTheRing: "THE BURDEN OF THE RING",
                    threeHunters: "THE THREE HUNTERS",
                    knightInTheDark: "A KNIGHT IN THE DARK",
                    secondBreakfast: "SECOND BREAKFAST",
                    wizardsDuel: "THE WIZARDS' DUEL",
                },
            },
            paytable: {
                title: "PAYTABLE",
                matchDescription:
                    "LINE UP 3 MATCHING\nSYMBOLS IN THE SAME\nCOLUMN TO WIN",
            },
            wildScatter: {
                title: "WILD & SCATTER",
                conditionalWild:
                    "Conditional <wild>WILD</wild>. Substitutes for<br>all Low value symbols.",
                wild: "<wild>WILD</wild>. Substitutes for all symbols<br>except for scatter.",
                respinScatter:
                    "<strong>Respin</strong> <scatter>SCATTER</scatter>: Every time it<br>lands, summon an Orc Uruk-Hai<br>that locks up to 6 high-value symbols<br>in place, then triggers a Respin.<br>The Respin <scatter>SCATTER</scatter> cannot<br>appear again for 10 spins.",
                bonusScatter:
                    "<scatter>SCATTER</scatter>. Land 3, 4, or 5<br><scatter>SCATTERS</scatter> to trigger the<br>BONUS GAME.",
            },
        },
    },
    errors: {
        server: {
            [GAME_ERROR_CODES.CONNECTING]: "Connecting...",
            [GAME_ERROR_CODES.CONNECTION_FAILED]:
                "Connection failed.\nPlease reload the game.",
            [GAME_ERROR_CODES.MAINTENANCE]:
                "System under maintenance.\nPlease come back later.",
            [GAME_ERROR_CODES.INVALID_BET_LEVEL]: "Invalid bet amount.",
            [GAME_ERROR_CODES.ACTIVE_ROUND_EXISTS]:
                "Round already in progress.",
            [GAME_ERROR_CODES.INSUFFICIENT_BALANCE]:
                "Insufficient balance.\n\nPlease change your wallet type\nor add funds to continue.",
            [GAME_ERROR_CODES.INVALID_STATE]:
                "Command invalid in current state.",
            [GAME_ERROR_CODES.INVALID_TOKEN]: "Account verification failed.",
            [GAME_ERROR_CODES.NO_ACTIVE_SESSION]:
                "Cannot perform action\nwithout an active bet.",
            [GAME_ERROR_CODES.TOKEN_CONFLICT]:
                "Unable to load the game.\n\nPlease close any other active sessions and reload.",
            [GAME_ERROR_CODES.SESSION_EXPIRED]:
                "Session expired.\nPlease reload the game.",
            [GAME_ERROR_CODES.ANOTHER_LOGIN]:
                "Your account was logged in\nfrom another location.",
            [GAME_ERROR_CODES.INTERNAL_ERROR]:
                "Server failure.\nPlease try again later.",
            [GAME_ERROR_CODES.PAYMENT_FAILED]:
                "Payment system is\ncurrently unavailable.\n\nPlease try again later.",
            [GAME_ERROR_CODES.BET_FAILED]:
                "Server failure.\nPlease try again later.",
            [GAME_ERROR_CODES.WIN_FAILED]:
                "Server failure.\nPlease try again later.",
            [GAME_ERROR_CODES.SESSION_CONFLICT]:
                "You still have an open session.\n\nContinuing with this session\nwill log out all others.",
            [GAME_ERROR_CODES.LOGIN_REQUIRED]: "Please log in to play.",
            [GAME_ERROR_CODES.GOODBYE]: "Session closed",
            unknown: "Unknown error (code: {code})",
            unexpected: "An unexpected error occurred",
        },
    },
};
