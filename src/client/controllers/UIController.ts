import { Controller, OnInit, OnStart } from "@flamework/core";
import { ContentProvider } from "@rbxts/services";
import { INTERFACE } from "client/constants";
import { ASSETS, getSound } from "shared/constants";
import { Signal } from "@antivivi/fletchette";

@Controller()
export class UIController implements OnInit, OnStart {
    preloadedAsset = new Signal<(asset: string) => void>();

    playSound(soundName: string) {
        getSound(soundName).Play();
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