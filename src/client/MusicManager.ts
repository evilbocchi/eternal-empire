import { Lighting, ReplicatedStorage, SoundService, TweenService, Workspace } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import { ASSETS, SOUND_EFFECTS_GROUP, getSound } from "shared/asset/GameAssets";
import { IS_EDIT } from "shared/Context";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

namespace MusicManager {
    class MusicState {
        public musicEnabled = false;
        public soundEffectsEnabled = false;
        public inChallenge = false;
        public currentArea: AreaId | undefined = undefined;
        public isTitleScreen = false;
        public isNight = false;

        public shouldPlayMusic(): boolean {
            return this.musicEnabled && (this.isTitleScreen || this.currentArea !== undefined);
        }

        public getMusicKey(): string | undefined {
            if (this.isTitleScreen) {
                return "title";
            }
            if (this.currentArea) {
                return `${this.currentArea}_${this.inChallenge}_${this.isNight}`;
            }
            return undefined;
        }
    }

    const state = new MusicState();
    let connection: RBXScriptConnection | undefined = undefined;

    export let playing: Sound | undefined = undefined;

    export const MUSIC_GROUP = new Instance("SoundGroup");
    MUSIC_GROUP.Name = "Music";
    MUSIC_GROUP.Parent = IS_EDIT ? Environment.PluginWidget : SoundService;

    export const TITLE_SCREEN_MUSIC = (ASSETS.WaitForChild("Eternal Empire") as Sound).Clone();
    TITLE_SCREEN_MUSIC.Parent = MUSIC_GROUP;

    for (const [id, area] of pairs(AREAS)) {
        const areaBounds = area.areaBoundsWorldNode?.getInstance();
        if (!areaBounds) continue;

        // Create dedicated sound group for this area's audio
        const areaSoundGroup = new Instance("SoundGroup");
        areaSoundGroup.Name = id;
        areaSoundGroup.Volume = 1;
        areaSoundGroup.Parent = MUSIC_GROUP;

        const loadSound = (sound: Instance) => {
            if (!sound.IsA("Sound")) return;
            sound.SoundGroup = areaSoundGroup;
            sound.SetAttribute("OriginalVolume", sound.Volume);
        };
        areaBounds.GetChildren().forEach((group) => {
            group = group.Clone();
            group.Parent = areaSoundGroup;
            loadSound(group);
            for (const child of group.GetChildren()) loadSound(child);
        });
    }

    /**
     * Selects a random music track for a given area, considering challenge and time of day.
     * @param id The AreaId to select music for.
     * @param inChallenge Whether the player is in a challenge.
     * @param isNight Whether it's night time.
     * @returns The selected Sound instance, or undefined.
     */
    function getRandomMusic(id: AreaId, inChallenge: boolean, isNight: boolean): Sound | undefined {
        const areaMusicFolder = MUSIC_GROUP.FindFirstChild(id);
        if (areaMusicFolder === undefined) return undefined;
        let folder = inChallenge
            ? ASSETS.WaitForChild("ChallengeMusic")
            : areaMusicFolder.FindFirstChild(isNight ? "Night" : "Day");
        if (folder === undefined) folder = areaMusicFolder;
        const current = folder.GetAttribute("Current");
        const sounds = folder.GetChildren();
        const s = sounds.size() - 1;
        const newCurrent = math.random(0, s);
        if (current === newCurrent && s > 0) {
            return getRandomMusic(id, inChallenge, isNight);
        }
        folder.SetAttribute("Current", newCurrent);
        return sounds[newCurrent] as Sound;
    }

    /** Checks if night music should be played based on the current time. */
    function isNight() {
        return math.abs(Lighting.ClockTime - 12) / 12 > 0.5;
    }

    export function fadeOut(sound: Sound) {
        const tween = TweenService.Create(sound, new TweenInfo(1), { Volume: 0 });
        tween.Completed.Once(() => {
            sound.Stop();
        });
        if (sound === playing) {
            playing = undefined;
        }
        tween.Play();
        connection?.Disconnect();
    }

    export function fadeIn(sound: Sound) {
        if (playing) {
            fadeOut(playing);
        }

        if (sound.SoundGroup === undefined) sound.SoundGroup = MUSIC_GROUP;
        sound.Volume = 0;
        sound.RollOffMinDistance = math.huge;
        sound.RollOffMaxDistance = math.huge;
        sound.RollOffMode = Enum.RollOffMode.Linear;
        if (!sound.IsPlaying) {
            sound.Play();
        }
        TweenService.Create(sound, new TweenInfo(1), {
            Volume: (sound.GetAttribute("OriginalVolume") as number) ?? 1,
        }).Play();
        playing = sound;
        return sound;
    }

    export function loopMusic() {
        let retrieved: Sound | undefined;
        if (state.isTitleScreen) {
            retrieved = TITLE_SCREEN_MUSIC;
        } else if (state.currentArea) {
            retrieved = getRandomMusic(state.currentArea, state.inChallenge, state.isNight);
        }

        if (retrieved === playing && retrieved !== undefined) return;

        if (retrieved === undefined) {
            warn("No music found for current state");
            return;
        }

        const music = fadeIn(retrieved);
        music.SetAttribute("Area", state.currentArea);

        connection?.Disconnect();
        connection = music.Ended.Once((soundId) => {
            if (playing?.SoundId === soundId) {
                playing = undefined;
            }
            task.delay(math.random(2, 5), loopMusic);
        });
    }

    let lastMusicKey: string | undefined = undefined;

    function updateMusic() {
        if (state.shouldPlayMusic()) {
            const currentKey = state.getMusicKey();
            if (currentKey !== lastMusicKey || !playing) {
                lastMusicKey = currentKey;
                loopMusic();
            }
        } else {
            if (playing) {
                playing.Stop();
                playing = undefined;
                lastMusicKey = undefined;
            }
        }
    }

    export function isEnabled() {
        return state.musicEnabled;
    }

    export function init() {
        // Initialize state
        const settings = Packets.settings.get();
        state.musicEnabled = settings.Music && Packets.serverMusicEnabled.get();
        state.soundEffectsEnabled = settings.SoundEffects;
        state.inChallenge = Packets.currentChallenge.get() !== "" && Packets.currentChallenge.get() !== undefined;
        state.currentArea = Packets.currentArea.get();
        state.isTitleScreen = Workspace.GetAttribute("Title") === true;
        state.isNight = math.abs(Lighting.ClockTime - 12) / 12 > 0.5;

        const settingsConnection = Packets.settings.observe((value) => {
            state.musicEnabled = value.Music && Packets.serverMusicEnabled.get();
            state.soundEffectsEnabled = value.SoundEffects;
            MUSIC_GROUP.Volume = state.musicEnabled ? 0.4 : 0;
            SOUND_EFFECTS_GROUP.Volume = state.soundEffectsEnabled ? 1 : 0;
            updateMusic();
        });

        const serverMusicConnection = Packets.serverMusicEnabled.observe(() => {
            state.musicEnabled = Packets.settings.get().Music && Packets.serverMusicEnabled.get();
            updateMusic();
        });

        const challengeConnection = Packets.currentChallenge.observe((challenge) => {
            state.inChallenge = challenge !== "" && challenge !== undefined;
            updateMusic();
        });

        const areaConnection = Packets.currentArea.observe(() => {
            state.currentArea = Packets.currentArea.get();
            updateMusic();
        });

        const titleConnection = Workspace.GetAttributeChangedSignal("Title").Connect(() => {
            state.isTitleScreen = Workspace.GetAttribute("Title") === true;
            updateMusic();
        });

        const timeConnection = Lighting.GetPropertyChangedSignal("ClockTime").Connect(() => {
            state.isNight = math.abs(Lighting.ClockTime - 12) / 12 > 0.5;
            updateMusic();
        });

        const oceanWaves = getSound("OceanWaves.mp3");
        oceanWaves.Parent = IS_EDIT ? Environment.PluginWidget : SOUND_EFFECTS_GROUP;
        oceanWaves.Volume = 0;
        oceanWaves.Looped = true;
        oceanWaves.Play();
        const cameraConnection = Workspace.CurrentCamera!.GetPropertyChangedSignal("CFrame").Connect(() => {
            const dist = Workspace.CurrentCamera!.CFrame.Y - -16.5; // Ocean level
            oceanWaves.Volume = (1 - math.abs(dist) / 100) / 10;
        });

        // Initial music update
        updateMusic();

        return () => {
            playing?.Stop();
            serverMusicConnection.Disconnect();
            settingsConnection.Disconnect();
            challengeConnection.Disconnect();
            areaConnection.Disconnect();
            titleConnection.Disconnect();
            timeConnection.Disconnect();
            cameraConnection.Disconnect();
            connection?.Disconnect();
            MUSIC_GROUP.Destroy();
            oceanWaves.Destroy();
        };
    }
}

export default MusicManager;
