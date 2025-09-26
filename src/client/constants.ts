/**
 * @fileoverview Defines commonly used client-side constants for player, UI, and color configuration in the Roblox game.
 * These constants provide convenient references to the local player, mouse, GUI, and standard colors.
 *
 * @since 1.0.0
 */

import { Players, StarterGui } from "@rbxts/services";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import { IS_EDIT } from "shared/Context";

/**
 * Reference to the local player.
 */
export const LOCAL_PLAYER = Players.LocalPlayer as Player | undefined;

/**
 * Observes changes to the local player's character and invokes the provided callback when it changes.
 * Also invokes the callback immediately if the character is already loaded.
 * @param callback Function to call with the new character model when it changes.
 * @returns A function to disconnect the observer.
 */
export const observeCharacter = (callback: (character: Model) => void) => {
    const dummy = getPlayerCharacter();
    if (dummy !== undefined) {
        callback(dummy);
    }
    if (LOCAL_PLAYER) {
        const connection = LOCAL_PLAYER.CharacterAdded.Connect(callback);
        return () => connection.Disconnect();
    } else {
        return () => {};
    }
};

/**
 * Reference to the local player's PlayerGui.
 */
export const PLAYER_GUI = (IS_EDIT ? StarterGui : LOCAL_PLAYER!.WaitForChild("PlayerGui")) as StarterGui;

/**
 * Reference to the Actor instance for parallel execution, if present.
 */
export const PARALLEL = script.Parent!.FindFirstChildOfClass("Actor")!;

/**
 * Color used to indicate collision (red).
 */
export const COLLISION_COLOR = new Color3(1, 0, 0);

/**
 * Color used to indicate non-collision (blue).
 */
export const NONCOLLISION_COLOR = Color3.fromRGB(35, 120, 172);
