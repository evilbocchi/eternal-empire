import { Flamework } from "@flamework/core";
import { Players, ReplicatedStorage, StarterGui, Workspace } from "@rbxts/services";
import Sandbox from "shared/Sandbox";

if (!Sandbox.synthesise()) {
    const starterInterface = StarterGui.FindFirstChild("Interface") as ScreenGui;
    if (starterInterface !== undefined) {
        starterInterface.Enabled = false;
    }

    Players.CharacterAutoLoads = false;

    const cso = Workspace.FindFirstChild("ClientSidedObjects");
    if (cso !== undefined)
        cso.Parent = ReplicatedStorage; // jtoh kit expects ClientSidedObjects to be in ReplicatedStorage
}

Flamework.addPaths("src/server/services");
Flamework.ignite();

if (!Sandbox.getEnabled()) {
    Players.CharacterAutoLoads = true;
    for (const player of Players.GetPlayers()) {
        player.LoadCharacter();
    }
}