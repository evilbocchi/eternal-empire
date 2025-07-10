/**
 * @fileoverview UIController - Client controller for managing the main player interface and asset preloading.
 *
 * Handles:
 * - Playing UI sounds
 * - Preloading assets (sounds, meshes, textures) for performance
 * - Enabling the main interface on start
 * - Firing signals when assets are preloaded
 *
 * The controller provides utility methods for UI sound playback and asset management, and ensures the interface is ready for the player.
 *
 * @since 1.0.0
 */
import Signal from "@antivivi/lemon-signal";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { ContentProvider } from "@rbxts/services";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";
import { ASSETS, getSound } from "shared/asset/GameAssets";

/**
 * The {@link ScreenGui} that contains the main interface for the {@link LOCAL_PLAYER}.
 */
export const INTERFACE = PLAYER_GUI.WaitForChild("Interface") as ScreenGui;

/**
 * Controller responsible for managing the main UI interface and preloading assets for the client.
 *
 * Provides methods for playing UI sounds, preloading assets, and enabling the interface.
 */
@Controller()
export default class UIController implements OnInit, OnStart {
    /** Signal fired when an asset has been preloaded. */
    preloadedAsset = new Signal<string>();

    /**
     * Plays a UI sound from the given asset path.
     * @param path The asset path of the sound.
     * @param volume The volume to play the sound at (default 0.5).
     * @returns The Sound instance that was played.
     */
    playSound(path: Filename<SoundAssetPath>, volume = 0.5) {
        const sound = getSound(path);
        sound.Volume = volume;
        sound.Play();
        return sound;
    }

    /**
     * Preloads all relevant assets (sounds, meshes, textures) for the UI and fires a signal when each is loaded.
     */
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

    /**
     * Initializes the UIController, starts asset preloading.
     */
    onInit() {
        task.spawn(() => this.preloadAssets());
    }

    /**
     * Enables the main interface when the controller starts.
     */
    onStart() {
        INTERFACE.Enabled = true;
    }
}