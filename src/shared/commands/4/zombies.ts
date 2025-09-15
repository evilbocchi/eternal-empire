import { ServerStorage, Workspace } from "@rbxts/services";
import Command, { CommandAPI } from "shared/commands/Command";
import { AREAS } from "shared/world/Area";

export = new Command(script.Name)
    .addAlias("apocalypse")
    .setDescription("Brains")
    .setExecute((_o) => {
        const asset = ServerStorage.WaitForChild("Fun").WaitForChild("Zombie") as Model;
        for (let i = 0; i < 15; i++) {
            for (const [_, area] of pairs(AREAS)) {
                const spawnLocation = area.getSpawnLocation();
                if (spawnLocation === undefined) continue;
                const zombie = asset.Clone();
                const humanoid = zombie.FindFirstChildOfClass("Humanoid");
                if (humanoid !== undefined) humanoid.WalkSpeed = math.random(14, 26);
                zombie.PivotTo(spawnLocation.CFrame.add(new Vector3(math.random(-45, 45), 0, math.random(-45, 45))));
                zombie.Parent = Workspace;
            }
        }
    })
    .setPermissionLevel(4);
