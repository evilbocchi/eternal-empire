import { Controller } from "@flamework/core";
import { ContentProvider } from "@rbxts/services";
import Signal from "@rbxutil/signal";
import { INTERFACE } from "client/constants";
import { UI_ASSETS } from "shared/constants";

@Controller()
export class UIController {
    preloadedAsset = new Signal<string>();

    getSound(soundName: string) {
        return UI_ASSETS.Sounds.WaitForChild(soundName + "Sound") as Sound;
    }

    playSound(soundName: string) {
        this.getSound(soundName).Play();
    }

    preloadAssets() {
        const assets = [] as string[];
        for (const uiObject of INTERFACE.GetDescendants()) {
            if (uiObject.IsA("ImageLabel")) {
                assets.push(uiObject.Image);
            }
        }
        ContentProvider.PreloadAsync(assets, (contentId, status) => {
            if (status === Enum.AssetFetchStatus.Success) {
                this.preloadedAsset.Fire(contentId);
            }
        });
    }
}