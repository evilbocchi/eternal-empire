import React, { Fragment, useEffect, useState } from "@rbxts/react";
import { Lighting, ReplicatedStorage, SoundService, TweenService, Workspace } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import { LOCAL_PLAYER } from "client/constants";
import { ASSETS, SOUND_EFFECTS_GROUP, getSound } from "shared/asset/GameAssets";
import { IS_CI } from "shared/Context";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

export class SoundManager {
    static MUSIC_GROUP: SoundGroup | undefined;
    static playing: Sound | undefined;
    /**
     * Fades in a sound by tweening its volume up and playing it.
     * @param sound The sound to fade in.
     * @returns The sound instance.
     */
    static fadeIn: (sound: Sound) => Sound;
    /**
     * Fades out a sound by tweening its volume to 0, then stops it.
     * @param sound The sound to fade out.
     */
    static fadeOut: (sound: Sound) => void;
    /**
     * Refreshes the background music based on area, challenge, and settings.
     * @param force If true, forces a music refresh even if already playing.
     */
    static refreshMusic: (force?: boolean) => void;
}

export default function SoundWindow() {
    const [musicGroup, setMusicGroup] = useState<SoundGroup>();

    useEffect(() => {
        const MUSIC_GROUP = new Instance("SoundGroup");
        MUSIC_GROUP.Name = "Music";
        MUSIC_GROUP.Volume = 1;
        MUSIC_GROUP.Parent = IS_CI ? Environment.PluginWidget : SoundService;

        const START_MUSIC = ASSETS.WaitForChild("JJT Money Empire!") as Sound;

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

        let inChallenge = false;
        let connection: RBXScriptConnection | undefined = undefined;

        /**
         * Selects a random music track for a given area, considering challenge and time of day.
         * @param id The AreaId to select music for.
         * @returns The selected Sound instance, or undefined.
         */
        const getRandomMusic = (id: AreaId): Sound | undefined => {
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
        };
        const isNight = () => math.abs(Lighting.ClockTime - 12) / 12 > 0.5;

        SoundManager.fadeOut = (sound: Sound) => {
            const tween = TweenService.Create(sound, new TweenInfo(1), { Volume: 0 });
            tween.Completed.Once(() => {
                sound.Stop();
            });
            tween.Play();
        };

        SoundManager.fadeIn = (sound: Sound) => {
            if (sound.SoundGroup === undefined) sound.SoundGroup = MUSIC_GROUP;
            sound.Volume = 0;
            sound.RollOffMinDistance = math.huge;
            sound.RollOffMaxDistance = math.huge;
            sound.RollOffMode = Enum.RollOffMode.Linear;
            if (!sound.IsPlaying) {
                sound.Play();
            }
            TweenService.Create(sound, new TweenInfo(1), {
                Volume: (sound.GetAttribute("OriginalVolume") as number) ?? 0.5,
            }).Play();
            SoundManager.playing = sound;
            return sound;
        };

        SoundManager.refreshMusic = (force?: boolean) => {
            let retrieved: Sound | undefined;
            let area: AreaId | undefined;
            // if (START_WINDOW.Parent === PLAYER_GUI) { TODO
            //     retrieved = START_MUSIC;
            // } else {
            // }
            area = LOCAL_PLAYER.GetAttribute("Area") as AreaId;

            if (retrieved === SoundManager.playing && retrieved !== undefined) return;

            if (SoundManager.playing !== undefined) {
                if (force !== true && (inChallenge || SoundManager.playing.GetAttribute("Area") === area)) return;

                SoundManager.fadeOut(SoundManager.playing);
                SoundManager.playing = undefined;
            }

            if (retrieved === undefined) {
                if (area === undefined || ReplicatedStorage.GetAttribute("Intro") === true) return;
                retrieved = getRandomMusic(area);
            }

            if (retrieved === undefined) {
                warn("No music found for area " + area);
                return;
            }

            const music = SoundManager.fadeIn(retrieved);
            music.SetAttribute("Area", area);
            if (connection !== undefined) connection.Disconnect();
            connection = music.Ended.Once((soundId) => {
                if (SoundManager.playing?.SoundId === soundId) {
                    SoundManager.playing = undefined;
                    //this.currentlyPlayingLabel.Text = "Currently not playing anything";
                }
                task.delay(math.random(5, 40), () => SoundManager.refreshMusic());
            });
        };

        let ready = false;
        const settingsConnection = Packets.settings.observe((value) => {
            MUSIC_GROUP.Volume = value.Music ? 0.5 : 0;
            SOUND_EFFECTS_GROUP.Volume = value.SoundEffects ? 1 : 0;
            if (ready === false) {
                ready = true;
                SoundManager.refreshMusic();
            }
        });
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(SoundManager.refreshMusic);
        const challengeConnection = Packets.currentChallenge.observe((challenge) => {
            inChallenge = challenge.name !== "";
            if (ready === true) SoundManager.refreshMusic(true);
        });

        const oceanWaves = getSound("OceanWaves.mp3");
        oceanWaves.Parent = IS_CI ? Environment.PluginWidget : SOUND_EFFECTS_GROUP;
        oceanWaves.Volume = 0;
        oceanWaves.Looped = true;
        oceanWaves.Play();
        const cameraConnection = Workspace.CurrentCamera!.GetPropertyChangedSignal("CFrame").Connect(() => {
            const dist = Workspace.CurrentCamera!.CFrame.Y - -16.5; // Ocean level
            oceanWaves.Volume = (1 - math.abs(dist) / 100) / 10;
        });

        Workspace.SetAttribute("ChangeMusic", false);
        const debugConnection = Workspace.GetAttributeChangedSignal("ChangeMusic").Connect(() =>
            SoundManager.refreshMusic(true),
        );
        SoundManager.MUSIC_GROUP = MUSIC_GROUP;
        setMusicGroup(MUSIC_GROUP);

        return () => {
            SoundManager.playing?.Stop();
            settingsConnection.Disconnect();
            challengeConnection.Disconnect();
            cameraConnection.Disconnect();
            debugConnection.Disconnect();
            connection?.Disconnect();
            MUSIC_GROUP.Destroy();
            oceanWaves.Destroy();
        };
    }, []);

    return <Fragment />;
}
