import { Dependency, Flamework } from "@flamework/core";
import { Players, ReplicatedStorage, StarterGui, Workspace } from "@rbxts/services";
import { GameAssetService } from "server/services/GameAssetService";

declare global {
    type GameUtils = typeof GameUtils;
}

(StarterGui.WaitForChild("Interface") as ScreenGui).Enabled = false;
Players.CharacterAutoLoads = false;

Workspace.WaitForChild("ClientSidedObjects").Parent = ReplicatedStorage;
Flamework.addPaths("src/server/services");
Flamework.ignite();

Players.CharacterAutoLoads = true;
for (const player of Players.GetPlayers()) {
    player.LoadCharacter();
}

/** hack object to export type */
const GameUtils = Dependency<GameAssetService>().GameUtils;