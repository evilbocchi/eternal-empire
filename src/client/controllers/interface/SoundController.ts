import { Controller, OnStart } from "@flamework/core";
import { Lighting, ReplicatedStorage, SoundService, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";
import { SETTINGS_WINDOW } from "client/controllers/interface/SettingsController";
import { START_WINDOW } from "client/controllers/interface/StartWindowController";
import { ASSETS, getSound, SOUND_EFFECTS_GROUP } from "shared/asset/GameAssets";
import { MUSIC_GROUP } from "shared/constants";
import Packets from "shared/Packets";

@Controller()
export default class SoundController implements OnStart {

    startMusic = ASSETS.WaitForChild("JJT Money Empire!") as Sound;
    currentlyPlayingLabel = SETTINGS_WINDOW.InteractionOptions.WaitForChild("CurrentlyPlaying").WaitForChild("Title") as TextLabel;
    musicEnabled = true;
    musicGroup = SoundService.WaitForChild("Music") as SoundGroup;
    playing = undefined as Sound | undefined;
    connection: RBXScriptConnection | undefined = undefined;
    tweenInfo = new TweenInfo(0.2);
    challengePlaylist = ASSETS.WaitForChild("ChallengeMusic");
    inChallenge = false;

    fadeOut(sound: Sound) {
        const tween = TweenService.Create(sound, new TweenInfo(1), { Volume: 0 });
        tween.Completed.Once(() => {
            sound.Stop();
        });
        tween.Play();
    }

    fadeIn(sound: Sound) {
        if (sound.SoundGroup === undefined)
            sound.SoundGroup = this.musicGroup;
        sound.Volume = 0;
        sound.RollOffMinDistance = math.huge;
        sound.RollOffMaxDistance = math.huge;
        sound.RollOffMode = Enum.RollOffMode.Linear;
        if (!sound.IsPlaying) {
            sound.Play();
        }
        TweenService.Create(sound, new TweenInfo(1), { Volume: sound.GetAttribute("OriginalVolume") as number ?? 0.5 }).Play();
        this.playing = sound;
        //this.currentlyPlayingLabel.Text = "Now playing: " + sound.Name;
        return sound;
    }

    refreshMusic(force?: boolean) {
        let retrieved: Sound | undefined;
        let area: AreaId | undefined;
        if (START_WINDOW.Parent === PLAYER_GUI) {
            retrieved = this.startMusic;
        }
        else {
            area = LOCAL_PLAYER.GetAttribute("Area") as AreaId;
        }

        if (retrieved === this.playing && retrieved !== undefined)
            return;

        if (this.playing !== undefined) {
            if (force !== true && (this.inChallenge || this.playing.GetAttribute("Area") === area))
                return;

            this.fadeOut(this.playing);
            this.playing = undefined;
        }

        if (retrieved === undefined) {
            if (area === undefined || ReplicatedStorage.GetAttribute("Intro") === true)
                return;
            retrieved = this.getRandomMusic(area);
        }

        if (retrieved === undefined) {
            warn("No music found for area " + area);
            return;
        }

        const music = this.fadeIn(retrieved);
        music.SetAttribute("Area", area);
        if (this.connection !== undefined)
            this.connection.Disconnect();
        this.connection = music.Ended.Once((soundId) => {
            if (this.playing?.SoundId === soundId) {
                this.playing = undefined;
                //this.currentlyPlayingLabel.Text = "Currently not playing anything";
            }
            task.delay(math.random(5, 40), () => this.refreshMusic());
        });
    }

    getRandomMusic(id: AreaId): Sound | undefined {
        const areaMusicFolder = MUSIC_GROUP.FindFirstChild(id);
        if (areaMusicFolder === undefined)
            return undefined;
        let folder = this.inChallenge ? this.challengePlaylist : areaMusicFolder.FindFirstChild(this.isNight() ? "Night" : "Day");
        if (folder === undefined)
            folder = areaMusicFolder;
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

    isNight() {
        return math.abs(Lighting.ClockTime - 12) / 12 > 0.5;
    }

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
            if (ready === true)
                this.refreshMusic(true);
        });

        const oceanWaves = getSound("OceanWaves.mp3");
        oceanWaves.Volume = 0;
        oceanWaves.Play();
        Workspace.CurrentCamera!.GetPropertyChangedSignal("CFrame").Connect(() => {
            const y = Workspace.CurrentCamera!.CFrame.Y;
            oceanWaves.Volume = (1 - (math.abs(y) / 100)) / 14;
        });

        // debug
        Workspace.SetAttribute("ChangeMusic", false);
        Workspace.GetAttributeChangedSignal("ChangeMusic").Connect(() => this.refreshMusic(true));
    }
}