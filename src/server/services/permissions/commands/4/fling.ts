import { Players } from "@rbxts/services";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("woosh")
    .setDescription("<player> : Weeeeee")
    .setExecute((o, p) => {
        const targets = CommandAPI.Command.findPlayers(o, p);
        if (targets.size() < 1) {
            CommandAPI.ChatHook.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        const rng = new Random();
        for (const target of targets) {
            const humanoid = target.Character?.FindFirstChildOfClass("Humanoid");
            if (humanoid === undefined) continue;
            const rootPart = humanoid.RootPart!;
            rootPart.PivotTo(rootPart.GetPivot().add(new Vector3(0, 1, 0)));
            rootPart.AssemblyLinearVelocity = rng.NextUnitVector().mul(5000);
            rootPart.AssemblyAngularVelocity = rng.NextUnitVector().mul(5000);
        }
        CommandAPI.ChatHook.sendPrivateMessage(o, `Flung players`, "color:138,255,138");
    })
    .setPermissionLevel(4);
