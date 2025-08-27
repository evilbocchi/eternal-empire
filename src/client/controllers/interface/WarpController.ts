/**
 * @fileoverview Client controller for managing the warp window and area teleportation UI.
 *
 * Handles:
 * - Setting up hotkeys for area teleportation
 * - Integrating with UIController and AdaptiveTabController for feedback and UI transitions
 * - Handling teleport requests and updating the UI based on success or failure
 *
 * The controller manages warp window hotkeys and coordinates area teleportation actions for the player.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import AdaptiveTabController, { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/core/AdaptiveTabController";
import HotkeysController from "client/controllers/core/HotkeysController";
import { AREAS } from "shared/Area";
import Packets from "shared/Packets";
import { playSound } from "shared/asset/GameAssets";

export const WARP_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Warp") as Frame & {
    [area in AreaId]: ImageButton
};

/**
 * Controller responsible for managing the warp window UI and area teleportation hotkeys.
 *
 * Sets up hotkeys for teleporting to areas and handles UI/sound feedback for teleport actions.
 */
@Controller()
export default class WarpController implements OnInit {

    constructor(private adaptiveTabController: AdaptiveTabController, private hotkeysController: HotkeysController) {

    }

    /**
     * Initializes the WarpController, sets up hotkeys for area teleportation.
     */
    onInit() {
        const keys = new Map<AreaId, Enum.KeyCode>();
        keys.set("BarrenIslands", Enum.KeyCode.One);
        keys.set("SlamoVillage", Enum.KeyCode.Two);

        const buttons = WARP_WINDOW.GetChildren();
        for (const button of buttons) {
            if (!button.IsA("ImageButton"))
                continue;
            const areaId = button.Name as AreaId;
            this.hotkeysController.setHotkey(button, keys.get(areaId)!, () => {
                if (WARP_WINDOW.Visible) {
                    const success = Packets.tpToArea.toServer(areaId);
                    if (success) {
                        playSound("Teleport.mp3");
                        this.adaptiveTabController.hideAdaptiveTab();
                    }
                    else {
                        playSound("Error.mp3");
                    }
                    return true;
                }
                return false;
            }, `Teleport to ${AREAS[areaId].name}`, 3);
        }
    }
}