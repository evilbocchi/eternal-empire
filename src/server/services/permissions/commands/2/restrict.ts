import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command("restrict")
    .addAlias("r")
    .setDescription("<player> <multiplier> : Restricts a player, removing their access to build and purchase permissions. Pass a multiplier to multiply the default 5 minute duration.")
    .setExecute((o, p, m) => {
        const targets = CommandAPI.Command.findPlayers(o, p);
        if (targets.size() < 1) {
            CommandAPI.ChatHook.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        const data = CommandAPI.Data.empireData;
        const duration = 5 * (m === undefined ? 1 : (tonumber(m) ?? 1));
        for (const target of targets) {
            if (target === o) {
                CommandAPI.ChatHook.sendPrivateMessage(o, "You can't restrict yourself.", "color:255,43,43");
                continue;
            }
            const userId = target.UserId;
            if (CommandAPI.Permissions.getPermissionLevel(userId) >= CommandAPI.Permissions.getPermissionLevel(o.UserId)) {
                CommandAPI.ChatHook.sendPrivateMessage(o, "You can't restrict someone with an equal/higher permission level.", "color:255,43,43");
                continue;
            }
            CommandAPI.ChatHook.sendPrivateMessage(o, `Restricted player ${target.Name}`, "color:138,255,138");
            const restrictionTime = tick() + (duration * 60);
            target.SetAttribute("RestrictionTime", restrictionTime);
            data.restricted.set(userId, restrictionTime);
            task.delay(duration * 60, () => {
                data.restricted.delete(userId);
                CommandAPI.Permissions.updatePermissionLevel(userId);
            });
            CommandAPI.Permissions.updatePermissionLevel(userId);
        }
    })
    .setPermissionLevel(2);