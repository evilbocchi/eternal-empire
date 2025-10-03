import { ReplicatedFirst } from "@rbxts/services";

const loadingScreenModule = require(
    script.Parent!.WaitForChild("LoadingScreen") as ModuleScript,
) as typeof import("./LoadingScreen");
const LoadingScreen = loadingScreenModule.default;

LoadingScreen.showLoadingScreen("");
ReplicatedFirst.RemoveDefaultLoadingScreen();
