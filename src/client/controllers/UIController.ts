import { Controller } from "@flamework/core";
import { ContentProvider } from "@rbxts/services";
import { INTERFACE } from "client/constants";
import { UI_ASSETS } from "shared/constants";
import { Signal } from "shared/utils/fletchette";

@Controller()
export class UIController {
    preloadedAsset = new Signal<(asset: string) => void>();

    getSound(soundName: string) {
        return UI_ASSETS.Sounds.WaitForChild(soundName + "Sound") as Sound;
    }

    playSound(soundName: string) {
        this.getSound(soundName).Play();
    }

    preloadAssets() {
        const assets = [] as string[];
        for (const object of UI_ASSETS.GetDescendants()) {
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
}