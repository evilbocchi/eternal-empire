/**
 * @fileoverview Client controller for managing music and sound effects in the game.
 *
 * Handles:
 * - Playing, fading in/out, and switching background music
 * - Managing sound effect and music group volumes based on settings
 * - Selecting music based on area, time of day, and challenge state
 * - Integrating with UI and settings controllers for feedback
 *
 * The controller manages music playback, transitions, and sound effect volumes, providing a dynamic audio experience for the player.
 *
 * @since 1.0.0
 */
import { Controller, OnStart } from "@flamework/core";
import { Lighting, ReplicatedStorage, SoundService, TweenService, Workspace } from "@rbxts/services";
import { PLAYER_GUI } from "client/constants";
import { LOCAL_PLAYER } from "shared/constants";
import { START_WINDOW } from "client/controllers/interface/StartWindowController";
import { ASSETS, getSound, SOUND_EFFECTS_GROUP } from "shared/asset/GameAssets";
import { MUSIC_GROUP } from "shared/constants";
import Packets from "shared/Packets";

/**
 * Controller responsible for managing music and sound effects, including playback, transitions, and volume control.
 *
 * Handles music selection based on area, challenge state, and time of day, and integrates with settings for volume control.
 */
@Controller()
export default class SoundController implements OnStart {
    /** The default start music sound instance. */
    startMusic = ASSETS.WaitForChild("JJT Money Empire!") as Sound;
    /** Whether music is enabled. */
    musicEnabled = true;
    /** The music sound group. */
    musicGroup = SoundService.WaitForChild("Music") as SoundGroup;
    /** The currently playing music sound. */
    playing = undefined as Sound | undefined;
    /** Connection for music end event. */
    connection: RBXScriptConnection | undefined = undefined;
    /** TweenInfo for sound transitions. */
    tweenInfo = new TweenInfo(0.2);
    /** Folder containing challenge music. */
    challengePlaylist = ASSETS.WaitForChild("ChallengeMusic");
    /** Whether the player is in a challenge. */
    inChallenge = false;

    /**
     * Fades out a sound by tweening its volume to 0, then stops it.
     * @param sound The sound to fade out.
     */
    fadeOut(sound: Sound) {
        const tween = TweenService.Create(sound, new TweenInfo(1), { Volume: 0 });
        tween.Completed.Once(() => {
            sound.Stop();
        });
        tween.Play();
    }

    /**
     * Fades in a sound by tweening its volume up and playing it.
     * @param sound The sound to fade in.
     * @returns The sound instance.
     */
    fadeIn(sound: Sound) {
        if (sound.SoundGroup === undefined) sound.SoundGroup = this.musicGroup;
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
        this.playing = sound;
        //this.currentlyPlayingLabel.Text = "Now playing: " + sound.Name;
        return sound;
    }

    /**
     * Refreshes the background music based on area, challenge, and settings.
     * @param force If true, forces a music refresh even if already playing.
     */
    refreshMusic(force?: boolean) {
        let retrieved: Sound | undefined;
        let area: AreaId | undefined;
        if (START_WINDOW.Parent === PLAYER_GUI) {
            retrieved = this.startMusic;
        } else {
            area = LOCAL_PLAYER.GetAttribute("Area") as AreaId;
        }

        if (retrieved === this.playing && retrieved !== undefined) return;

        if (this.playing !== undefined) {
            if (force !== true && (this.inChallenge || this.playing.GetAttribute("Area") === area)) return;

            this.fadeOut(this.playing);
            this.playing = undefined;
        }

        if (retrieved === undefined) {
            if (area === undefined || ReplicatedStorage.GetAttribute("Intro") === true) return;
            retrieved = this.getRandomMusic(area);
        }

        if (retrieved === undefined) {
            warn("No music found for area " + area);
            return;
        }

        const music = this.fadeIn(retrieved);
        music.SetAttribute("Area", area);
        if (this.connection !== undefined) this.connection.Disconnect();
        this.connection = music.Ended.Once((soundId) => {
            if (this.playing?.SoundId === soundId) {
                this.playing = undefined;
                //this.currentlyPlayingLabel.Text = "Currently not playing anything";
            }
            task.delay(math.random(5, 40), () => this.refreshMusic());
        });
    }

    /**
     * Selects a random music track for a given area, considering challenge and time of day.
     * @param id The AreaId to select music for.
     * @returns The selected Sound instance, or undefined.
     */
    getRandomMusic(id: AreaId): Sound | undefined {
        const areaMusicFolder = MUSIC_GROUP.FindFirstChild(id);
        if (areaMusicFolder === undefined) return undefined;
        let folder = this.inChallenge
            ? this.challengePlaylist
            : areaMusicFolder.FindFirstChild(this.isNight() ? "Night" : "Day");
        if (folder === undefined) folder = areaMusicFolder;
        const current = folder.GetAttribute("Current");
        const sounds = folder.GetChildren();
        const s = sounds.size() - 1;
        const newCurrent = math.random(0, s);
        if (current === newCurrent && s > 0) {
            return this.getRandomMusic(id);
        }
        folder.SetAttribute("Current", newCurrent);
        return sounds[newCurrent] as Sound;
    }

    /**
     * Determines if it is currently night in the game.
     * @returns True if night, false otherwise.
     */
    isNight() {
        return math.abs(Lighting.ClockTime - 12) / 12 > 0.5;
    }

    /**
     * Initializes the SoundController, sets up settings observers and music refresh logic.
     */
    onStart() {
        let ready = false;
        Packets.settings.observe((value) => {
            this.musicGroup.Volume = value.Music ? 0.5 : 0;
            SOUND_EFFECTS_GROUP.Volume = value.SoundEffects ? 1 : 0;
            if (ready === false) {
                ready = true;
                this.refreshMusic();
            }
        });
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(() => this.refreshMusic());
        Packets.currentChallenge.observe((challenge) => {
            this.inChallenge = challenge.name !== "";
            if (ready === true) this.refreshMusic(true);
        });

        const oceanWaves = getSound("OceanWaves.mp3");
        oceanWaves.Volume = 0;
        oceanWaves.Play();
        Workspace.CurrentCamera!.GetPropertyChangedSignal("CFrame").Connect(() => {
            const y = Workspace.CurrentCamera!.CFrame.Y;
            oceanWaves.Volume = (1 - math.abs(y) / 100) / 14;
        });

        // debug
        Workspace.SetAttribute("ChangeMusic", false);
        Workspace.GetAttributeChangedSignal("ChangeMusic").Connect(() => this.refreshMusic(true));
    }
}
