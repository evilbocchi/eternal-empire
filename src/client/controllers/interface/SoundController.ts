import { Controller, OnInit } from "@flamework/core";
import { Lighting, ReplicatedStorage, SoundService, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, SETTINGS_WINDOW, START_WINDOW } from "client/constants";
import { AREAS, SOUND_EFFECTS_GROUP, getSound } from "shared/constants";
import { Fletchette } from "@antivivi/fletchette";

@Controller()
export class SoundController implements OnInit {

    currentlyPlayingLabel = SETTINGS_WINDOW.InteractionOptions.WaitForChild("CurrentlyPlaying").WaitForChild("Title") as TextLabel;
    musicEnabled = true;
    musicGroup = SoundService.WaitForChild("Music") as SoundGroup;
    playing = undefined as Sound | undefined;
    connection: RBXScriptConnection | undefined = undefined;
    tweenInfo = new TweenInfo(0.2);

    fadeOut(sound: Sound) {
        const tween = TweenService.Create(sound, new TweenInfo(1), {Volume: 0});
        tween.Completed.Once(() => {
            sound.Stop();
        });
        tween.Play();
    }

    fadeIn(sound: Sound) {
        sound.Volume = 0;
        if (!sound.IsPlaying) {
            sound.Play();
        }
        TweenService.Create(sound, new TweenInfo(1), {Volume: sound.GetAttribute("OriginalVolume") as number ?? 0.5}).Play();
        this.playing = sound;
        this.currentlyPlayingLabel.Text = "Now playing: " + sound.Name;
    }

    refreshMusic(force?: boolean) {
        if (START_WINDOW.Visible === true && force !== true)
            return;
        const area = LOCAL_PLAYER.GetAttribute("Area") as keyof (typeof AREAS);
        if (this.playing !== undefined) {
            if (this.playing.Parent?.Name !== area || force === true)
                this.fadeOut(this.playing);
            else
                return;
        }
        if (area !== undefined && ReplicatedStorage.GetAttribute("Intro") !== true) {
            const music = this.getRandomMusic(area);
            this.fadeIn(music);
            if (this.connection !== undefined)
                this.connection.Disconnect();
            this.connection = music.Ended.Once(() => {
                if (this.playing === music) {
                    this.playing = undefined;
                    this.currentlyPlayingLabel.Text = "Currently not playing anything";
                }
                task.delay(math.random(5, 10), () => this.refreshMusic());
            });
        }
    }
    
    getRandomMusic(id: keyof (typeof AREAS)): Sound {
        const folder = AREAS[id].areaBounds!.WaitForChild(this.isNight() ? "Night" : "Day");
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

    onInit() {
        Fletchette.getCanister("SettingsCanister").settings.observe((value) => {
            this.musicGroup.Volume = value.Music ? 0.5 : 0;
            SOUND_EFFECTS_GROUP.Volume = value.SoundEffects ? 1 : 0;
        });
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(() => this.refreshMusic());
        this.refreshMusic();

        const oceanWaves = getSound("OceanWaves");
        oceanWaves.Volume = 0;
        oceanWaves.Play();
        Workspace.CurrentCamera!.GetPropertyChangedSignal("CFrame").Connect(() => {
            const y = Workspace.CurrentCamera!.CFrame.Y;
            oceanWaves.Volume = (1 - (math.abs(y) / 100)) / 5;
        });

        // debug
        Workspace.SetAttribute("ChangeMusic", false);
        Workspace.GetAttributeChangedSignal("ChangeMusic").Connect(() => this.refreshMusic());
    }
}