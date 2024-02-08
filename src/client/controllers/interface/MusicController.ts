import { Controller, OnInit } from "@flamework/core";
import { SoundService, TweenService } from "@rbxts/services";
import { LOCAL_PLAYER, MUTE_BUTTON_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { AREAS } from "shared/constants";
import Signal from "@rbxutil/signal";

@Controller()
export class MusicController implements OnInit {
    musicEnabled = true;
    musicGroup = SoundService.WaitForChild("Music") as SoundGroup;
    musicEnabledChanged = new Signal<boolean>();
    playing = undefined as Sound | undefined;

    constructor(private uiController: UIController) {

    }

    refreshMuteButtonWindow() {
        MUTE_BUTTON_WINDOW.Button.Text = "Music: " + (this.musicEnabled ? "ON" : "OFF");
    }

    setMusicEnabled(musicEnabled: boolean) {
        this.musicEnabled = musicEnabled;
        this.musicEnabledChanged.Fire(musicEnabled);
        this.refreshMuteButtonWindow();
    }

    fadeOut(sound: Sound) {
        TweenService.Create(sound, new TweenInfo(1), {Volume: 0}).Play();
    }

    fadeIn(sound: Sound) {
        sound.Volume = 0;
        if (!sound.IsPlaying) {
            sound.Play();
        }
        TweenService.Create(sound, new TweenInfo(1), {Volume: 0.5}).Play();
        this.playing = sound;
    }

    refreshMusic(area: keyof (typeof AREAS)) {
        if (this.playing !== undefined && this.playing.Parent?.Name !== area) {
            this.fadeOut(this.playing);
        }
        if (area !== undefined) {
            const music = this.getRandomMusic(area);
            this.fadeIn(music);
            const connection = music.Ended.Connect(() => {
                this.refreshMusic(area);
                connection.Disconnect();
            });
        }
        MUTE_BUTTON_WINDOW.SongTitle.Text = this.playing === undefined ? "<no song playing>" : this.playing.Name;
    }
    
    getRandomMusic(id: keyof (typeof AREAS)): Sound {
        const areaFolder = this.musicGroup.WaitForChild(id);
        const current = areaFolder.GetAttribute("Current");
        const sounds = areaFolder.GetChildren();
        const s = sounds.size() - 1;
        const newCurrent = math.random(0, s);
        if (current === newCurrent && s > 0) {
            return this.getRandomMusic(id);
        }
        areaFolder.SetAttribute("Current", newCurrent);
        return sounds[newCurrent] as Sound;
    }

    onInit() {
        MUTE_BUTTON_WINDOW.Button.MouseEnter.Connect(() => {
            MUTE_BUTTON_WINDOW.SongTitle.Visible = true;
        });
        MUTE_BUTTON_WINDOW.Button.MouseLeave.Connect(() => {
            MUTE_BUTTON_WINDOW.SongTitle.Visible = false;
        });
        MUTE_BUTTON_WINDOW.Button.Activated.Connect(() => {
            this.uiController.playSound("Click");
            this.setMusicEnabled(!this.musicEnabled);
        });
        this.musicEnabledChanged.Connect((musicEnabled) => {
            this.musicGroup.Volume = musicEnabled ? 1 : 0;
        });
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(() => this.refreshMusic(LOCAL_PLAYER.GetAttribute("Area") as keyof (typeof AREAS)));
        this.refreshMuteButtonWindow();
    }
}