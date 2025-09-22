import { RunService } from "@rbxts/services";

const UserGameSettings = RunService.IsClient() ? UserSettings().GetService("UserGameSettings") : undefined;

export default UserGameSettings;
