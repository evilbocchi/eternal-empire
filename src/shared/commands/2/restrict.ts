import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("r")
    .setDescription(
        "<player> <multiplier> : Restricts a player, removing their access to build and purchase permissions. Pass a multiplier to multiply the default 5 minute duration.",
    )
    .setExecute((sender, p, m) => {
        const targets = CommandAPI.Command.findPlayers(sender, p);
        if (targets.size() < 1) {
            CommandAPI.ChatHook.sendPrivateMessage(sender, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        const data = CommandAPI.empireData;
        const duration = 5 * (m === undefined ? 1 : (tonumber(m) ?? 1));
        for (const target of targets) {
            if (target === sender) {
                CommandAPI.ChatHook.sendPrivateMessage(sender, "You can't restrict yourself.", "color:255,43,43");
                continue;
            }
            const userId = target.UserId;
            if (CommandAPI.Permissions.isLowerLevel(sender, userId)) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    "You can't restrict someone with an equal/higher permission level.",
                    "color:255,43,43",
                );
                continue;
            }
            CommandAPI.ChatHook.sendPrivateMessage(sender, `Restricted player ${target.Name}`, "color:138,255,138");
            const restrictionTime = tick() + duration * 60;
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
