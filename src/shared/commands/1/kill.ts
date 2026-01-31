import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("unalive")
    .setDescription("<player> : Kills a player's character.")
    .setExecute((sender, p) => {
        const targets = Server.Command.findPlayers(sender, p);
        if (targets.size() < 1) {
            Server.ChatHook.sendPrivateMessage(sender, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        for (const target of targets) {
            const humanoid = target.Character?.FindFirstChildOfClass("Humanoid");
            if (humanoid !== undefined) humanoid.TakeDamage(humanoid.Health + 1);
        }
        Server.ChatHook.sendPrivateMessage(sender, `Killed players`, "color:138,255,138");
    })
    .setPermissionLevel(1);
