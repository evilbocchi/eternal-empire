import { ReplicatedFirst, StarterGui } from "@rbxts/services";

const loadingScreenModule = require(
    script.Parent!.WaitForChild("LoadingScreen") as ModuleScript,
) as typeof import("./LoadingScreen");
const LoadingScreen = loadingScreenModule.default;

LoadingScreen.showLoadingScreen("", true);
ReplicatedFirst.RemoveDefaultLoadingScreen();

StarterGui.SetCoreGuiEnabled("Backpack", false);
StarterGui.SetCoreGuiEnabled("PlayerList", false);
