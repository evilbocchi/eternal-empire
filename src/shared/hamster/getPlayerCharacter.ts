import { Players, Workspace } from "@rbxts/services";
import { IS_EDIT } from "shared/Context";

/**
 * Equivalent to `player.Character`, but handles edge cases in Edit mode and when player is undefined.
 * @param player The player whose character to get. If undefined, gets the local player's character.
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

/**
 * Gets all player characters in the game.
 * @returns An array of character models.
 */
export function getAllPlayerCharacters() {
    const characters = new Array<Model>();
    for (const player of Players.GetPlayers()) {
        const character = getPlayerCharacter(player);
        if (character) {
            characters.push(character);
        }
    }
    if (IS_EDIT && Players.LocalPlayer === undefined) {
        const character = getPlayerCharacter();
        if (character) {
            characters.push(character);
        }
    }
    return characters;
}
