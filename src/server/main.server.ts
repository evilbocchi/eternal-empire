import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { igniteFlameworkServer } from "shared/Context";
import Sandbox from "shared/Sandbox";

if (!Sandbox.synthesise()) {
    Players.CharacterAutoLoads = false;
    const cso = Workspace.FindFirstChild("ClientSidedObjects");
    if (cso !== undefined) cso.Parent = ReplicatedStorage; // jtoh kit expects ClientSidedObjects to be in ReplicatedStorage
}

igniteFlameworkServer();

if (!Sandbox.getEnabled()) {
    Players.CharacterAutoLoads = true;
    for (const player of Players.GetPlayers()) {
        player.LoadCharacter();
    }
}
