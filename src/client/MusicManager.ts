import { Lighting, ReplicatedStorage, SoundService, TweenService, Workspace } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import { ASSETS, SOUND_EFFECTS_GROUP, getSound } from "shared/asset/GameAssets";
import { IS_EDIT } from "shared/Context";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

namespace MusicManager {
    let inChallenge = false;
    let connection: RBXScriptConnection | undefined = undefined;

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
     * @returns The selected Sound instance, or undefined.
     */
    function getRandomMusic(id: AreaId): Sound | undefined {
        const areaMusicFolder = MUSIC_GROUP.FindFirstChild(id);
        if (areaMusicFolder === undefined) return undefined;
        let folder = inChallenge
            ? ASSETS.WaitForChild("ChallengeMusic")
            : areaMusicFolder.FindFirstChild(isNight() ? "Night" : "Day");
        if (folder === undefined) folder = areaMusicFolder;
        const current = folder.GetAttribute("Current");
        const sounds = folder.GetChildren();
        const s = sounds.size() - 1;
        const newCurrent = math.random(0, s);
        if (current === newCurrent && s > 0) {
            return getRandomMusic(id);
        }
        folder.SetAttribute("Current", newCurrent);
        return sounds[newCurrent] as Sound;
    }

    /** Checks if night music should be played based on the current time. */
    function isNight() {
        return math.abs(Lighting.ClockTime - 12) / 12 > 0.5;
    }

    export let playing: Sound | undefined = undefined;

    export function fadeOut(sound: Sound) {
        const tween = TweenService.Create(sound, new TweenInfo(1), { Volume: 0 });
        tween.Completed.Once(() => {
            sound.Stop();
        });
        if (sound === playing) {
            playing = undefined;
        }
        tween.Play();
    }

    export function fadeIn(sound: Sound) {
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

    export function refreshMusic(force?: boolean) {
        let retrieved: Sound | undefined;
        let area: AreaId | undefined;
        if (Workspace.GetAttribute("Title") === true) {
            retrieved = TITLE_SCREEN_MUSIC;
        }
        area = Packets.currentArea.get();

        if (retrieved === playing && retrieved !== undefined) return;

        if (playing !== undefined) {
            if (force !== true && (inChallenge || playing.GetAttribute("Area") === area)) return;

            fadeOut(playing);
        }

        if (retrieved === undefined) {
            if (area === undefined || ReplicatedStorage.GetAttribute("NewBeginningsWakingUp")) return;
            retrieved = getRandomMusic(area);
        }

        if (retrieved === undefined) {
            warn("No music found for area " + area);
            return;
        }

        const music = fadeIn(retrieved);
        music.SetAttribute("Area", area);
        if (connection !== undefined) connection.Disconnect();
        connection = music.Ended.Once((soundId) => {
            if (playing?.SoundId === soundId) {
                playing = undefined;
            }
            task.delay(math.random(2, 5), refreshMusic);
        });
    }

    export function isEnabled() {
        return Packets.settings.get().Music && Packets.serverMusicEnabled.get();
    }

    export function init() {
        const settingsConnection = Packets.settings.observe((value) => {
            MUSIC_GROUP.Volume = isEnabled() ? 0.4 : 0;
            SOUND_EFFECTS_GROUP.Volume = value.SoundEffects ? 1 : 0;
        });

        const serverMusicConnection = Packets.serverMusicEnabled.observe(() => {
            const musicEnabled = isEnabled();

            if (!musicEnabled && playing) {
                fadeOut(playing);
            } else if (musicEnabled && Packets.settings.get().Music) {
                refreshMusic(true);
            }
        });

        const challengeConnection = Packets.currentChallenge.observe((challenge) => {
            inChallenge = challenge !== "" && challenge !== undefined;
            refreshMusic(true);
        });
        const areaConnection = Packets.currentArea.observe(() => {
            refreshMusic();
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

        return () => {
            playing?.Stop();
            serverMusicConnection.Disconnect();
            settingsConnection.Disconnect();
            challengeConnection.Disconnect();
            areaConnection.Disconnect();
            cameraConnection.Disconnect();
            connection?.Disconnect();
            MUSIC_GROUP.Destroy();
            oceanWaves.Destroy();
        };
    }
}

export default MusicManager;
