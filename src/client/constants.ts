import { Players, Workspace } from "@rbxts/services";

export const LOCAL_PLAYER = Players.LocalPlayer;
export const MOUSE = LOCAL_PLAYER.GetMouse();
export const PLAYER_GUI = LOCAL_PLAYER.WaitForChild("PlayerGui") as StarterGui;
export const PARALLEL = script.Parent!.FindFirstChildOfClass("Actor")!;

export const COLLISION_COLOR = new Color3(1, 0, 0);
export const NONCOLLISION_COLOR = Color3.fromRGB(35, 120, 172);