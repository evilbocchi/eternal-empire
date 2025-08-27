/**
 * @fileoverview Client controller for managing the main player interface and asset preloading.
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
import { Controller, OnInit, OnStart } from "@flamework/core";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";

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
    /**
     * Initializes the UIController, starts asset preloading.
     */
    onInit() {

    }

    /**
     * Enables the main interface when the controller starts.
     */
    onStart() {
        INTERFACE.Enabled = true;
    }
}