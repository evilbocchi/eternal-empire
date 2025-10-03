import { IS_EDIT, IS_SERVER } from "shared/Context";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Packets from "shared/Packets";

namespace CustomProximityPrompt {
    const proximityPrompts = new Map<
        string,
        {
            instance: ProximityPrompt;
            callback: (player: Player) => void;
        }
    >();

    export function trigger(proximityPrompt: ProximityPrompt) {
        Packets.triggerProximityPrompt.toServer(proximityPrompt.GetFullName());
    }

    export function onTrigger(proximityPrompt: ProximityPrompt, callback: (player: Player) => void) {
        const path = proximityPrompt.GetFullName();
        proximityPrompts.set(path, {
            instance: proximityPrompt,
            callback: (player) => {
                const container = proximityPrompt.Parent;
                if (container === undefined || !container.IsA("PVInstance")) return;

                // check distance between player and container
                if (!IS_EDIT) {
                    const playerPos = getPlayerCharacter(player)?.GetPivot();
                    if (playerPos === undefined) return;

                    const containerPos = container.GetPivot();
                    const distance = playerPos.Position.sub(containerPos.Position).Magnitude;
                    if (distance > proximityPrompt.MaxActivationDistance + 5) return;
                }

                callback(player);
            },
        });
        return () => {
            proximityPrompts.delete(path);
        };
    }

    // Listen for server triggers
    if (IS_SERVER || IS_EDIT) {
        Packets.triggerProximityPrompt.fromClient((player, path) => {
            const prompt = proximityPrompts.get(path);
            if (prompt) {
                prompt.callback(player);
            }
        });
    }
}

export default CustomProximityPrompt;
