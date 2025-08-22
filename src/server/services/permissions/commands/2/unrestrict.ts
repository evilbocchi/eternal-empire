import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command("unrestrict")
    .addAlias("ur")
    .setDescription("<player> : Unrestricts a player.")
    .setExecute((o, p, m) => {
        const targets = CommandAPI.Command.findPlayers(o, p);
        if (targets.size() < 1) {
            CommandAPI.ChatHook.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        const data = CommandAPI.Data.empireData;
        for (const target of targets) {
            const userId = target.UserId;
            if (data.restricted.delete(userId)) {
                CommandAPI.ChatHook.sendPrivateMessage(o, `Unrestricted player ${target.Name}`, "color:138,255,138");
                CommandAPI.Permissions.updatePermissionLevel(userId);
            }
            else {
                CommandAPI.ChatHook.sendPrivateMessage(o, `${target.Name} is not restricted`, "color:255,43,43");
            }
        }
    })
    .setPermissionLevel(2);