import { Players, Workspace } from "@rbxts/services";
import { IS_EDIT } from "shared/Context";

/**
 * Reference to the local player's character.
 * @returns The character model, or undefined if not loaded.
 */
export function getPlayerCharacter(player?: Player) {
    if (player === undefined) {
        const localPlayer = Players.LocalPlayer;
        if (localPlayer === undefined) {
            if (IS_EDIT) {
                return Workspace.FindFirstChild("Player") as Model | undefined;
            } else {
                return undefined;
            }
        }
        return localPlayer.Character;
    }

    return player.Character;
}
