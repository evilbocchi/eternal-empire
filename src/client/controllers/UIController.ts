import Signal from "@antivivi/lemon-signal";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { ContentProvider } from "@rbxts/services";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";
import { ASSETS, getSound } from "shared/asset/GameAssets";

/**
 * The {@link ScreenGui} that contains the main interface for the {@link LOCAL_PLAYER}.
 */
export const INTERFACE = PLAYER_GUI.WaitForChild("Interface") as ScreenGui;

@Controller()
export default class UIController implements OnInit, OnStart {
    preloadedAsset = new Signal<string>();

    playSound(path: Filename<SoundAssetPath>, volume = 0.5) {
        const sound = getSound(path);
        sound.Volume = volume;
        sound.Play();
        return sound;
    }

    preloadAssets() {
        const assets = [] as string[];
        for (const object of ASSETS.GetDescendants()) {
            if (object.IsA("Sound"))
                assets.push(object.SoundId);
            else if (object.IsA("MeshPart"))
                assets.push(object.MeshId);
            else if (object.IsA("ParticleEmitter"))
                assets.push(object.Texture);
        }
        for (const uiObject of INTERFACE.GetDescendants()) {
            if (uiObject.IsA("ImageLabel")) {
                assets.push(uiObject.Image);
            }
        }
        ContentProvider.PreloadAsync(assets, (contentId, status) => {
            if (status === Enum.AssetFetchStatus.Success) {
                this.preloadedAsset.fire(contentId);
            }
        });
    }

    onInit() {
        task.spawn(() => this.preloadAssets());
    }

    onStart() {
        INTERFACE.Enabled = true;
    }
}