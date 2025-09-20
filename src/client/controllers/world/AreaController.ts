import { Controller, OnStart } from "@flamework/core";
import { ReplicatedStorage } from "@rbxts/services";
import ShakeController from "client/controllers/world/ShakeController";
import { playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";
import SlamoVillageConnection from "shared/world/nodes/SlamoVillageConnection";

/**
 * Controller responsible for managing area UI, unlock effects, and stat bar updates.
 *
 * Handles area stat display, unlock animations, and integration with UI and data packets.
 */
@Controller()
export default class AreaController implements OnStart {
    constructor(private shakeController: ShakeController) {}

    /**
     * Starts the AreaController, manages special area connections and unlock state.
     */
    onStart() {
        Packets.areaUnlocked.fromServer(() => {
            this.shakeController.shake();
            playSound("Thunder.mp3");
        });

        const connectionInstance = SlamoVillageConnection.waitForInstance();
        Packets.unlockedAreas.observe((areas) => {
            if (areas.has("SlamoVillage")) {
                connectionInstance.Parent = SlamoVillageConnection.originalParent;
            } else {
                connectionInstance.Parent = ReplicatedStorage;
            }
        });
    }
}
