import { Controller, OnStart } from "@flamework/core";
import { ReplicatedStorage } from "@rbxts/services";
import Shaker from "client/ui/components/effect/Shaker";
import { playSound } from "shared/asset/GameAssets";
import eat from "shared/hamster/eat";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import SlamoVillageConnection from "shared/world/nodes/SlamoVillageConnection";

/**
 * Controller responsible for managing area UI, unlock effects, and stat bar updates.
 *
 * Handles area stat display, unlock animations, and integration with UI and data packets.
 */
@Controller()
export default class AreaController implements OnStart {
    /**
     * Starts the AreaController, manages special area connections and unlock state.
     */
    onStart() {
        if (Sandbox.getEnabled()) return;

        eat(
            Packets.areaUnlocked.fromServer(() => {
                Shaker.shake();
                playSound("Thunder.mp3");
            }),
            "Disconnect",
        );

        const connectionInstance = SlamoVillageConnection.waitForInstance();
        const connection = Packets.unlockedAreas.observe((areas) => {
            if (areas.has("SlamoVillage")) {
                connectionInstance.Parent = SlamoVillageConnection.originalParent;
            } else {
                connectionInstance.Parent = ReplicatedStorage;
            }
        });
        eat(() => {
            connection.disconnect();
            connectionInstance.Parent = SlamoVillageConnection.originalParent;
        });
    }
}
