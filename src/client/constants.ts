/**
 * @fileoverview Defines commonly used client-side constants for player, UI, and color configuration in the Roblox game.
 * These constants provide convenient references to the local player, mouse, GUI, and standard colors.
 *
 * @since 1.0.0
 */

import { Players } from "@rbxts/services";
import { IS_EDIT } from "shared/Context";

/**
 * Reference to the local player.
 */
export const LOCAL_PLAYER = Players.LocalPlayer;

/**
 * Reference to the local player's mouse.
 */
export const MOUSE = LOCAL_PLAYER.GetMouse();

/**
 * Reference to the local player's PlayerGui.
 */
export const PLAYER_GUI = (IS_EDIT ? undefined : LOCAL_PLAYER.WaitForChild("PlayerGui")) as StarterGui;

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
