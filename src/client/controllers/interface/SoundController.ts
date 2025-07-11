import { Controller, OnStart } from "@flamework/core";
import { Lighting, ReplicatedStorage, SoundService, StarterGui, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, PLAYER_GUI, SETTINGS_WINDOW, START_WINDOW } from "client/constants";
import { AREAS, ASSETS, SOUND_EFFECTS_GROUP, getSound } from "shared/constants";
import Packets from "shared/network/Packets";

@Controller()
export class SoundController implements OnStart {

    currentlyPlayingLabel = SETTINGS_WINDOW.InteractionOptions.WaitForChild("CurrentlyPlaying").WaitForChild("Title") as TextLabel;
    musicEnabled = true;
    musicGroup = SoundService.WaitForChild("Music") as SoundGroup;
    playing = undefined as Sound | undefined;
    connection: RBXScriptConnection | undefined = undefined;
    tweenInfo = new TweenInfo(0.2);
    challengePlaylist = ASSETS.WaitForChild("ChallengeMusic");
    inChallenge = false;

    fadeOut(sound: Sound) {
        const tween = TweenService.Create(sound, new TweenInfo(1), {Volume: 0});
        tween.Completed.Once(() => {
            sound.Stop();
        });
        tween.Play();
    }

    fadeIn(sound: Sound) {
        sound = sound.Clone();
        if (sound.SoundGroup === undefined)
            sound.SoundGroup = this.musicGroup;
        sound.Volume = 0;
        sound.RollOffMinDistance = math.huge;
        sound.RollOffMaxDistance = math.huge;
        sound.RollOffMode = Enum.RollOffMode.Linear;
        sound.Stopped.Once(() => sound.Destroy());
        sound.Ended.Once(() => sound.Destroy());
        if (!sound.IsPlaying) {
            sound.Play();
        }
        TweenService.Create(sound, new TweenInfo(1), {Volume: sound.GetAttribute("OriginalVolume") as number ?? 0.5}).Play();
        sound.Parent = StarterGui;
        this.playing = sound;
        this.currentlyPlayingLabel.Text = "Now playing: " + sound.Name;
        return sound;
    }

    refreshMusic(force?: boolean) {
        if (START_WINDOW.Parent === PLAYER_GUI && force !== true)
            return;
        const area = LOCAL_PLAYER.GetAttribute("Area") as AreaId;
        if (this.playing !== undefined) {
            if (this.inChallenge && force !== true)
                return;

            if (this.playing.GetAttribute("Area") !== area || force === true)
                this.fadeOut(this.playing);
            else
                return;
        }
        if (area !== undefined && ReplicatedStorage.GetAttribute("Intro") !== true) {
            const music = this.fadeIn(this.getRandomMusic(area));
            music.SetAttribute("Area", area);
            if (this.connection !== undefined)
                this.connection.Disconnect();
            this.connection = music.Ended.Once((soundId) => {
                if (this.playing?.SoundId === soundId) {
                    this.playing = undefined;
                    this.currentlyPlayingLabel.Text = "Currently not playing anything";
                }
                task.delay(math.random(5, 10), () => this.refreshMusic());
            });
        }
    }
    
    getRandomMusic(id: AreaId): Sound {
        let folder = this.inChallenge ? this.challengePlaylist : AREAS[id].areaBounds!.FindFirstChild(this.isNight() ? "Night" : "Day");
        if (folder === undefined)
            folder = AREAS[id].areaBounds!;
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
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(() => {
            if (ready === true)
                this.refreshMusic();
        });
        Packets.currentChallenge.observe((challenge) => {
            this.inChallenge = challenge.name !== "";
            if (ready === true)
                this.refreshMusic(true);
        });

        const oceanWaves = getSound("OceanWaves");
        oceanWaves.Volume = 0;
        oceanWaves.Play();
        Workspace.CurrentCamera!.GetPropertyChangedSignal("CFrame").Connect(() => {
            const y = Workspace.CurrentCamera!.CFrame.Y;
            oceanWaves.Volume = (1 - (math.abs(y) / 100)) / 7;
        });

        // debug
        Workspace.SetAttribute("ChangeMusic", false);
        Workspace.GetAttributeChangedSignal("ChangeMusic").Connect(() => this.refreshMusic(true));
    }
}