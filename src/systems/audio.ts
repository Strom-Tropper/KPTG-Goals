import { GOAL_EVENT_NAMES, goalEvents } from "@/modules/game/engine/game.events";
import { goalState } from "@/modules/game/engine/game.state";
import { SOUND_FILES, type SoundName } from "./audio.config";
import bgSoundUrl from "../../raw-assets/audio{m}{copy}/bgSound.mp3";
import boomUrl from "../../raw-assets/audio{m}{copy}/boom.mp3";
import btnUrl from "../../raw-assets/audio{m}{copy}/btn.mp3";
import clickUrl from "../../raw-assets/audio{m}{copy}/click.mp3";
import coinUrl from "../../raw-assets/audio{m}{copy}/coin.mp3";
import winUrl from "../../raw-assets/audio{m}{copy}/win.mp3";

type PlayOptions = {
    loop?: boolean;
    singleInstance?: boolean;
    volume?: number;
    complete?: () => void;
};

const MUSIC_NAME: SoundName = "bgm_main";
const MUSIC_VOLUME = 0.22;
const MUSIC_VOLUME_SCALE: Partial<Record<SoundName, number>> = {
    bgm_main: 0.85,
};
const MASTER_SFX_VOLUME = 0.35;
const SFX_VOLUME: Partial<Record<SoundName, number>> = {};
const NEVER_LOOP_SFX = new Set<SoundName>([
    // "sfx_bigwin_amount",
    // "sfx_bigwin_popup",
    // "sfx_jackpot",
]);
const GESTURE_EVENTS = [
    "pointerdown",
    "pointerup",
    "touchstart",
    "touchend",
    "click",
    "keydown",
] as const;

class AudioSystem {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private music: HTMLAudioElement | null = null;
    private readonly musicUrls = new Map<SoundName, string>();
    private musicName: SoundName = MUSIC_NAME;
    private stageMusicName: SoundName = MUSIC_NAME;
    private bonusGameActive = false;

    private readonly buffers = new Map<SoundName, AudioBuffer>();
    private readonly loading = new Map<SoundName, Promise<void>>();
    private readonly activeSources = new Map<
        SoundName,
        Set<AudioBufferSourceNode>
    >();
    private readonly musicPauseRequests = new Set<string>();
    private musicMuted = false;
    private sfxMuted = false;
    private readonly isSafari =
        typeof navigator !== "undefined" &&
        navigator.vendor.toLowerCase().includes("apple");
    private audioUnlocked = false;
    private lifecyclePaused = false;
    private resumeTimer: ReturnType<typeof setTimeout> | null = null;
    private eventSoundsBound = false;
    private visibilityBound = false;
    private goalSoundsBound = false;
    private goalPhase = "";
    private outcomeArmed = false;

    constructor() {
        if (typeof window === "undefined") return;
        this.initWebAudio();
        this.bindAudioUnlock();
        this.mountGoalSources();
        this.setupGoalSounds();
        this.setupVisibilityHandling();
    }

    add(file: string, url: string) {
        for (const [name, filename] of Object.entries(SOUND_FILES) as [
            SoundName,
            string,
        ][]) {
            if (filename !== file) continue;
            if (name.startsWith("bgm_")) {
                this.musicUrls.set(name, url);
                void fetch(url);
                if (name === this.musicName) this.createMusic(url);
            } else if (!this.buffers.has(name) && !this.loading.has(name)) {
                this.loading.set(name, this.loadBuffer(name, url));
            }
        }
    }

    // setStage(stage: number, freeSpins = 0) {
    //     const index = Number.isFinite(stage)
    //         ? Math.max(0, Math.min(3, Math.trunc(stage)))
    //         : 0;
    //     const name: SoundName =
    //         freeSpins > 0
    //             ? "bgm_freespin"
    //             : (
    //                   [
    //                       "bgm_main",
    //                       "bgm_moria",
    //                       "bgm_argonath",
    //                       "bgm_doom",
    //                   ] as const
    //               )[index];
    //     this.stageMusicName = name;
    //     if (this.bonusGameActive) return;
    //     this.setMusic(name);
    // }

    private setMusic(name: SoundName) {
        if (name === this.musicName) return;
        this.musicName = name;
        const url = this.musicUrls.get(name);
        if (url) this.createMusic(url);
        void this.playMusic();
    }

    async play(
        name: SoundName,
        options: PlayOptions = {},
        shouldPlay?: () => boolean,
    ): Promise<AudioBufferSourceNode | void> {
        if (name === MUSIC_NAME) {
            await this.playMusic(options, shouldPlay);
            return;
        }
        if (
            !this.audioUnlocked ||
            this.lifecyclePaused ||
            this.sfxMuted ||
            (shouldPlay && !shouldPlay())
        ) {
            return;
        }

        await this.loading.get(name);
        if (
            (shouldPlay && !shouldPlay()) ||
            !(await this.resumeAudioContext())
        ) {
            return;
        }

        const context = this.audioContext;
        const buffer = this.buffers.get(name);
        if (!context || !this.masterGain || !buffer) return;
        if (options.singleInstance) this.stopSfx(name);

        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = buffer;
        source.loop = NEVER_LOOP_SFX.has(name)
            ? false
            : (options.loop ?? false);
        gain.gain.value =
            (options.volume ?? SFX_VOLUME[name] ?? 1) * MASTER_SFX_VOLUME;
        source.connect(gain);
        gain.connect(this.masterGain);

        const sources =
            this.activeSources.get(name) ?? new Set<AudioBufferSourceNode>();
        sources.add(source);
        this.activeSources.set(name, sources);
        source.addEventListener(
            "ended",
            () => {
                sources.delete(source);
                source.disconnect();
                gain.disconnect();
                options.complete?.();
            },
            { once: true },
        );
        source.start();
        return source;
    }

    isOutputMuted() {
        return this.musicMuted && this.sfxMuted;
    }

    toggleOutputMute() {
        const muted = !this.isOutputMuted();
        if (this.musicMuted !== muted) this.toggleMusicMute();
        if (this.sfxMuted !== muted) this.toggleSfxMute();
        return muted;
    }

    isMusicMuted() {
        return this.musicMuted;
    }

    toggleMusicMute() {
        this.musicMuted = !this.musicMuted;
        if (this.music) this.music.muted = this.musicMuted;
        if (this.musicMuted) this.music?.pause();
        else void this.playMusic();
        return this.musicMuted;
    }

    isSfxMuted() {
        return this.sfxMuted;
    }

    toggleSfxMute() {
        this.sfxMuted = !this.sfxMuted;
        if (this.masterGain) this.masterGain.gain.value = this.sfxMuted ? 0 : 1;
        if (this.sfxMuted) this.stopAllSfx();
        return this.sfxMuted;
    }

    setupVisibilityHandling() {
        if (this.visibilityBound || typeof document === "undefined") return;
        document.addEventListener(
            "visibilitychange",
            this.handleVisibilityChange,
        );
        window.addEventListener("pagehide", this.handleAppHidden);
        window.addEventListener("pageshow", this.handleAppVisible);
        window.addEventListener("blur", this.handleAppHidden);
        window.addEventListener("focus", this.handleAppVisible);
        this.visibilityBound = true;
    }

    // setupEventSounds() {
    //     if (this.eventSoundsBound) return;
    //     this.eventSoundsBound = true;
    //     const play = (name: SoundName, options?: PlayOptions) => {
    //         void this.play(name, options);
    //     };
    //
    //     eventBus.on(EVENT_NAMES.BET_LEVEL_CHANGED, () =>
    //         play("button_click_blevel"),
    //     );
    //     eventBus.on(EVENT_NAMES.SPIN_REQUEST, (request) => {
    //         if (!request?.instantStop) play("button_click_spin");
    //     });
    //     eventBus.on(EVENT_NAMES.AUDIO_BUTTON_OTHER_CLICKED, () =>
    //         play("button_click_other"),
    //     );
    //     eventBus.on(EVENT_NAMES.TURBO_CHANGED, (turbo) =>
    //         play(turbo ? "button_turbo" : "button_click_other", {
    //             volume: turbo ? 1.5 : 1,
    //         }),
    //     );
    //     eventBus.on(EVENT_NAMES.AUDIO_PAGE_CHANGED, () => play("sfx_page"));
    //     eventBus.on(EVENT_NAMES.SPIN_STATE_CHANGED, (spinning) => {
    //         if (spinning)
    //             play("sfx_rolling", { loop: true, singleInstance: true });
    //         else this.stopSfx("sfx_rolling");
    //     });
    //     eventBus.on(EVENT_NAMES.AUDIO_REEL_STOPPED, () => play("sfx_stop"));
    //     eventBus.on(EVENT_NAMES.AUDIO_REELS_STOPPED, () =>
    //         this.stopSfx("sfx_rolling"),
    //     );
    //     eventBus.on(EVENT_NAMES.AUDIO_WIN_LOW, () => play("sfx_win_low"));
    //     eventBus.on(EVENT_NAMES.AUDIO_WIN_HIGH, () => play("sfx_win_high"));
    //     eventBus.on(EVENT_NAMES.AUDIO_WINLINE_SHOWN, () => play("sfx_winline"));
    //     eventBus.on(EVENT_NAMES.AUDIO_WILD_WIN_SHOWN, () =>
    //         play("sfx_tpf_wild"),
    //     );
    //     eventBus.on(EVENT_NAMES.AUDIO_WIN_AMOUNT_STARTED, () =>
    //         play("sfx_win_amount", { loop: true, singleInstance: true }),
    //     );
    //     eventBus.on(EVENT_NAMES.AUDIO_WIN_AMOUNT_STOPPED, () =>
    //         this.stopSfx("sfx_win_amount"),
    //     );
    //     eventBus.on(EVENT_NAMES.AUDIO_BIGWIN_AMOUNT_STARTED, () =>
    //         play("sfx_bigwin_amount", { singleInstance: true }),
    //     );
    //     eventBus.on(EVENT_NAMES.AUDIO_BIGWIN_AMOUNT_STOPPED, () =>
    //         this.stopSfx("sfx_bigwin_amount"),
    //     );
    //     eventBus.on(EVENT_NAMES.AUDIO_BIGWIN_POPUP_SHOWN, (level) => {
    //         this.stopSfx("sfx_rolling");
    //         this.playExclusiveSfx(
    //             level === "mega"
    //                 ? "sfx_megawin"
    //                 : level === "ultra"
    //                   ? "sfx_ultrawin"
    //                   : "sfx_bigwin_popup",
    //             "bigwin-popup",
    //         );
    //     });
    //     eventBus.on(
    //         EVENT_NAMES.RADIAL_WIN_LINES_SHOWN,
    //         ({ winLines }: { winLines: WinLine[] }) => {
    //             const line =
    //                 winLines.find(
    //                     (line) => line.lore_id && LORE_SOUNDS[line.lore_id],
    //                 ) ?? winLines.find((line) => SYMBOL_SOUNDS[line.symbol_id]);
    //             const sound =
    //                 line &&
    //                 ((line.lore_id && LORE_SOUNDS[line.lore_id]) ||
    //                     SYMBOL_SOUNDS[line.symbol_id]);
    //             if (sound) play(sound, { singleInstance: true });
    //         },
    //     );
    //     eventBus.on(
    //         EVENT_NAMES.RADIAL_FEATURE_SYMBOLS_SHOWN,
    //         ({ triggerMini, isRespin }) => {
    //             if (triggerMini)
    //                 play("sfx_knightdark", { singleInstance: true });
    //             else if (isRespin)
    //                 play("sfx_saruman", { singleInstance: true });
    //         },
    //     );
    //     eventBus.on(EVENT_NAMES.RADIAL_SPECIAL_STATES_SHOWN, () =>
    //         play("sfx_tpf_wild", { singleInstance: true }),
    //     );
    //     const startBonusMusic = () => {
    //         this.bonusGameActive = true;
    //         this.setMusic("bgm_bonus");
    //     };
    //     eventBus.on(EVENT_NAMES.BONUS_GAME_STARTED, startBonusMusic);
    //     eventBus.on(EVENT_NAMES.MINIGAME_STARTED, startBonusMusic);
    //     eventBus.on(EVENT_NAMES.BONUS_GAME_ENDED, () => {
    //         this.bonusGameActive = false;
    //         this.setMusic(this.stageMusicName);
    //     });
    //     eventBus.on(EVENT_NAMES.AUDIO_BONUS_WIN_POPUP_SHOWN, () =>
    //         play("sfx_bonus_win", { singleInstance: true }),
    //     );
    //     eventBus.on(EVENT_NAMES.AUDIO_BONUS_LOSE_POPUP_SHOWN, () =>
    //         play("sfx_bonus_lose", { singleInstance: true }),
    //     );
    //     eventBus.on(EVENT_NAMES.AUDIO_JACKPOT_SHOWN, () =>
    //         this.playExclusiveSfx("sfx_jackpot", "jackpot"),
    //     );
    // }

    private mountGoalSources() {
        this.add("bgSound.mp3", bgSoundUrl);
        this.add("btn.mp3", btnUrl);
        this.add("click.mp3", clickUrl);
        this.add("coin.mp3", coinUrl);
        this.add("win.mp3", winUrl);
        this.add("boom.mp3", boomUrl);
    }

    private setupGoalSounds() {
        if (this.goalSoundsBound) return;
        this.goalSoundsBound = true;
        goalEvents.on(GOAL_EVENT_NAMES.BET_LEVEL_CHANGED, () => {
            void this.play("sfx_btn", { singleInstance: true });
        });
        goalEvents.on(GOAL_EVENT_NAMES.SCREEN, () => {
            this.followGoalRound();
        });
    }

    armOutcome() {
        this.outcomeArmed = true;
    }

    private followGoalRound() {
        const round = goalState.round;
        const cleared = round.phase === "standby" ? 0 : round.clearedColumns;
        const armed = this.outcomeArmed;
        this.outcomeArmed = false;
        if (armed && this.goalPhase === "playing" && round.phase === "ended") {
            const exploded = goalState.cells.some((column) =>
                column.some((cell) => cell.mark === "explode"),
            );
            if (exploded) {
                void this.play("sfx_boom", { singleInstance: true });
            } else if (cleared > 0) {
                void this.play("sfx_win", { singleInstance: true });
            }
        }
        this.goalPhase = round.phase;
    }

    private initWebAudio() {
        if (this.audioContext || typeof AudioContext === "undefined") return;
        this.audioContext = new AudioContext();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
    }

    private createMusic(url: string) {
        if (typeof Audio === "undefined") return;

        if (!this.music) {
            this.music = new Audio();
        } else {
            this.music.pause();
        }

        // Keep one media element for every BGM. Mobile browsers can tie
        // autoplay permission to the element that was unlocked by the user's
        // gesture, so replacing it during a server-driven stage transition
        // can leave all subsequent music blocked.
        this.music.src = url;
        this.music.loop = true;
        this.music.preload = "auto";
        this.music.volume =
            MUSIC_VOLUME * (MUSIC_VOLUME_SCALE[this.musicName] ?? 1);
        this.music.muted = this.musicMuted;
        this.music.setAttribute("playsinline", "");
        this.music.load();
        void this.playMusic();
    }

    private async loadBuffer(name: SoundName, url: string) {
        try {
            if (!this.audioContext) return;
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`${response.status} ${response.statusText}`);
            const buffer = await this.audioContext.decodeAudioData(
                await response.arrayBuffer(),
            );
            this.buffers.set(name, buffer);
        } catch (error) {
            console.warn(`[Audio] Failed to load ${name}:`, error);
        } finally {
            this.loading.delete(name);
        }
    }

    private async playMusic(
        options: PlayOptions = {},
        shouldPlay?: () => boolean,
    ) {
        const music = this.music;
        if (
            !music ||
            this.lifecyclePaused ||
            this.musicMuted ||
            this.musicPauseRequests.size > 0 ||
            (shouldPlay && !shouldPlay()) ||
            (!music.paused && !music.ended)
        ) {
            return;
        }
        music.loop = options.loop ?? true;
        music.volume =
            (options.volume ?? MUSIC_VOLUME) *
            (MUSIC_VOLUME_SCALE[this.musicName] ?? 1);
        try {
            await music.play();
            this.audioUnlocked = true;
            void this.resumeAudioContext();
        } catch (error) {
            const blocked =
                error instanceof DOMException && error.name === "NotAllowedError";
            if (!blocked) console.warn("[Audio] Failed to play bgm_main:", error);
        }
    }

    playExclusiveSfx(
        name: SoundName,
        token: string,
        resumeMusicOnComplete = true,
    ) {
        if (this.sfxMuted) return;
        this.musicPauseRequests.add(token);
        this.music?.pause();
        void this.play(name, {
            singleInstance: true,
            complete: () =>
                this.finishExclusiveSfx(token, resumeMusicOnComplete),
        }).then((source) => {
            if (!source) this.finishExclusiveSfx(token, resumeMusicOnComplete);
        });
    }

    private finishExclusiveSfx(token: string, resumeMusic = true) {
        this.musicPauseRequests.delete(token);
        if (resumeMusic) void this.playMusic();
    }

    private stopSfx(name: SoundName) {
        const sources = this.activeSources.get(name);
        if (!sources) return;
        this.activeSources.delete(name);
        sources.forEach((source) => {
            try {
                source.stop();
            } catch {
                // Source may already have ended.
            }
        });
    }

    private stopAllSfx() {
        [...this.activeSources.keys()].forEach((name) => this.stopSfx(name));
    }

    private async resumeAudioContext() {
        if (!this.audioContext) return false;
        if (this.lifecyclePaused) return false;
        if (this.audioContext.state === "running") return true;
        try {
            await this.audioContext.resume();
            return (this.audioContext.state as AudioContextState) === "running";
        } catch {
            return false;
        }
    }

    private readonly handleAudioUnlock = () => {
        this.audioUnlocked = true;
        void this.resumeAudioContext();
        void this.playMusic();
    };

    private bindAudioUnlock() {
        GESTURE_EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, this.handleAudioUnlock, {
                passive: true,
                capture: true,
            });
        });
    }

    private readonly handleVisibilityChange = () => {
        if (document.hidden) this.handleAppHidden();
        else this.handleAppVisible();
    };

    private readonly handleAppHidden = () => {
        if (this.resumeTimer !== null) {
            clearTimeout(this.resumeTimer);
            this.resumeTimer = null;
        }
        if (this.lifecyclePaused) return;
        this.lifecyclePaused = true;
        this.musicPauseRequests.clear();
        this.music?.pause();
        this.stopAllSfx();
        void this.audioContext?.suspend().catch(() => undefined);
    };

    private readonly handleAppVisible = () => {
        if (typeof document !== "undefined" && document.hidden) return;
        if (!this.lifecyclePaused) return;

        if (this.isSafari) {
            if (this.resumeTimer !== null) clearTimeout(this.resumeTimer);
            // WebKit can report a context as running while its output remains
            // silent after backgrounding. Force a fresh suspend/resume cycle
            // and ignore input during the short recovery window so rapid spin
            // clicks cannot start sources against the interrupted context.
            void this.audioContext?.suspend().catch(() => undefined);
            this.resumeTimer = setTimeout(() => {
                this.resumeTimer = null;
                if (typeof document !== "undefined" && document.hidden) return;
                this.lifecyclePaused = false;
                void this.audioContext?.resume().catch(() => undefined);
                void this.playMusic();
            }, 200);
            return;
        }

        this.lifecyclePaused = false;
        if (!this.audioUnlocked) return;
        void this.resumeAudioContext();
        void this.playMusic();
    };
}

export const audioSystem = new AudioSystem();
