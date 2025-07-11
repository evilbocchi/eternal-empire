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
    tweenInfo = new TweenInfo(0.2);

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
        TweenService.Create(sound, new TweenInfo(1), {Volume: sound.GetAttribute("OriginalVolume") as number ?? 0.5}).Play();
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
        this.showSongTitle();
        const songTitle = (this.playing === undefined ? "<no song playing>" : this.playing.Name);
        const nowPlayingLabel = "Now playing: " + songTitle;
        MUTE_BUTTON_WINDOW.Frame.SongTitle.Text = nowPlayingLabel;
        task.delay(3, () => {
            if (MUTE_BUTTON_WINDOW.Frame.SongTitle.Text === nowPlayingLabel) {
                this.hideSongTitle();
                MUTE_BUTTON_WINDOW.Frame.SongTitle.Text = songTitle;
            }
        });
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

    showSongTitle() {
        TweenService.Create(MUTE_BUTTON_WINDOW.Frame, this.tweenInfo, { BackgroundTransparency: 0.5 }).Play();
        TweenService.Create(MUTE_BUTTON_WINDOW.Frame.SongTitle, this.tweenInfo, { TextTransparency: 0 }).Play();
        TweenService.Create(MUTE_BUTTON_WINDOW.Frame.UIPadding, this.tweenInfo, { PaddingLeft: new UDim(0, 7), PaddingRight: new UDim(0, 7) }).Play();
        MUTE_BUTTON_WINDOW.Frame.Visible = true;
    }

    hideSongTitle() {
        TweenService.Create(MUTE_BUTTON_WINDOW.Frame.UIPadding, this.tweenInfo, { PaddingLeft: new UDim(0, 0), PaddingRight: new UDim(0, 0) }).Play();
        const t = TweenService.Create(MUTE_BUTTON_WINDOW.Frame, this.tweenInfo, { BackgroundTransparency: 1 });
        TweenService.Create(MUTE_BUTTON_WINDOW.Frame.SongTitle, this.tweenInfo, { TextTransparency: 1 }).Play();
        t.Play();
        t.Completed.Once(() => MUTE_BUTTON_WINDOW.Frame.Visible = false);
    }

    onInit() {
        MUTE_BUTTON_WINDOW.Button.MouseMoved.Connect(() => this.showSongTitle());
        MUTE_BUTTON_WINDOW.Button.MouseEnter.Connect(() => this.showSongTitle());
        MUTE_BUTTON_WINDOW.Button.MouseLeave.Connect(() => this.hideSongTitle());
        MUTE_BUTTON_WINDOW.Button.Activated.Connect(() => {
            this.uiController.playSound("Click");
            this.setMusicEnabled(!this.musicEnabled);
        });
        this.musicEnabledChanged.Connect((musicEnabled) => {
            this.musicGroup.Volume = musicEnabled ? 0.5 : 0;
        });
        const onAreaChanged = () => this.refreshMusic(LOCAL_PLAYER.GetAttribute("Area") as keyof (typeof AREAS));
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(() => onAreaChanged());
        onAreaChanged();
        this.refreshMuteButtonWindow();
    }
}