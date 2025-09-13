/**
 * @fileoverview Client controller for managing permissions, donations, and game modification events.
 *
 * Handles:
 * - Handling donation and code sharing events
 * - Integrating with UIController, EffectController, and AdaptiveTabController
 * - Responding to game modification packets for developer/admin actions
 *
 * The controller manages permission-based feedback for donation and game modification events.
 * Commands UI is now handled by the dedicated CommandsController with React components.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import EffectController from "client/controllers/world/EffectController";
import { playSound } from "shared/asset/GameAssets";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
/**
 * Controller responsible for managing permissions, donation/game modification events, and code sharing.
 *
 * Handles donation feedback, code sharing UI, and game modification events.
 * Commands UI is now handled by the dedicated CommandsController.
 */
@Controller()
export default class PermissionsController implements OnInit {
    constructor(private effectController: EffectController) {}

    /**
     * Initializes the PermissionsController, sets up listeners for donations and game modifications.
     */
    onInit() {
        Packets.donationGiven.fromServer(() => {
            playSound("PowerUp.mp3");
            this.effectController.camShake.Shake(CameraShaker.Presets.Bump);
        });

        Packets.modifyGame.fromServer((param) => {
            if (param === "markplaceableeverywhere") {
                Items.itemsPerId.forEach((item) => item.placeableEverywhere());
            }
        });
    }
}
