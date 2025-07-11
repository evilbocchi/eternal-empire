import { Flamework } from "@flamework/core";
import { Players, ReplicatedStorage, StarterGui, Workspace } from "@rbxts/services";

Players.CharacterAutoLoads = false;
Workspace.WaitForChild("ClientSidedObjects").Parent = ReplicatedStorage;
Flamework.addPaths("src/server/services");
Flamework.ignite();

(StarterGui.WaitForChild("Interface") as ScreenGui).Enabled = false;
Players.CharacterAutoLoads = true;
for (const player of Players.GetPlayers()) {
    player.LoadCharacter();
}
