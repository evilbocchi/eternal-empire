import { getInstanceInfo } from "@antivivi/vrldk";
import { RunService, Workspace } from "@rbxts/services";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import eat from "shared/hamster/eat";

class GameSpeed {
    static speed = 1;

    static {
        let oldSpeed = this.speed;
        const connection = RunService.Heartbeat.Connect(() => {
            if (GameSpeed.speed !== oldSpeed) {
                oldSpeed = GameSpeed.speed;
                Workspace.Gravity = 196.2 * oldSpeed;
                print("Changed gravity");

                // Update all placed items with new speed
                for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
                    getInstanceInfo(model, "UpdateSpeed")?.();
                }
            }
        });
        eat(connection, "Disconnect");
    }
}

export = GameSpeed;
