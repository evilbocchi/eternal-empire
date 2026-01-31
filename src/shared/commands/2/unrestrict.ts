import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("ur")
    .setDescription("<player> : Unrestricts a player.")
    .setExecute((o, p, m) => {
        const targets = Server.Command.findPlayers(o, p);
        if (targets.size() < 1) {
            Server.ChatHook.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        const data = Server.empireData;
        for (const target of targets) {
            const userId = target.UserId;
            if (data.restricted.delete(userId)) {
                Server.ChatHook.sendPrivateMessage(o, `Unrestricted player ${target.Name}`, "color:138,255,138");
                Server.Permissions.updatePermissionLevel(userId);
            } else {
                Server.ChatHook.sendPrivateMessage(o, `${target.Name} is not restricted`, "color:255,43,43");
            }
        }
    })
    .setPermissionLevel(2);
