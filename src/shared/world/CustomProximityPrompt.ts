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

    /**
     * Triggers the proximity prompt as if the local player had activated it.
     * @param proximityPrompt The proximity prompt instance to trigger
     */
    export function trigger(proximityPrompt: ProximityPrompt) {
        Packets.triggerProximityPrompt.toServer(proximityPrompt.GetFullName());
    }

    /**
     * Registers a callback for when a proximity prompt is triggered by a player.
     * Only use this once the proximity prompt is parented.
     * @param proximityPrompt The proximity prompt instance to monitor
     * @param callback The callback to invoke when the prompt is triggered
     * @returns A function to unregister the callback
     */
    export function onTrigger(proximityPrompt: ProximityPrompt, callback: (player: Player) => void) {
        const path = proximityPrompt.GetFullName();
        if (proximityPrompts.has(path)) {
            warn(`ProximityPrompt at path ${path} is already registered!`);
        }

        proximityPrompts.set(path, {
            instance: proximityPrompt,
            callback: (player) => {
                const container = proximityPrompt.Parent;
                if (container === undefined || !container.IsA("PVInstance") || !proximityPrompt.Enabled) return;

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
            print(prompt === undefined ? "Prompt not found!" : "Prompt found.");
            if (prompt) {
                prompt.callback(player);
            }
        });
    }
}

export default CustomProximityPrompt;
