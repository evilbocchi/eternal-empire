import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("tp")
    .setDescription("<teleporter> <to> : Teleport players to a target player.")
    .setExecute((sender, p, t) => {
        if (sender === undefined) {
            warn("teleport command can only be run by a player.");
            return;
        }

        const teleporters = CommandAPI.Command.findPlayers(sender, p);
        const targets = CommandAPI.Command.findPlayers(sender, t);
        const size = targets.size();
        if (size === 0) {
            CommandAPI.ChatHook.sendPrivateMessage(sender, `No target called ${t} found`, "color:255,43,43");
            return;
        } else if (size > 1) {
            CommandAPI.ChatHook.sendPrivateMessage(sender, `Too many targets specified: ${t}`, "color:255,43,43");
            return;
        }
        const target = targets[0];
        const destination = target.Character?.GetPivot();
        if (destination === undefined) return;
        for (const teleporter of teleporters) {
            if (CommandAPI.Permissions.isLowerLevel(sender, teleporter.UserId, true)) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    `You cannot teleport a player with a permission level higher than your own`,
                    "color:255,43,43",
                );
                continue;
            }
            teleporter.Character?.PivotTo(destination);
        }
        CommandAPI.ChatHook.sendPrivateMessage(sender, `Teleported ${p} to ${t}`, "color:138,255,138");
    })
    .setPermissionLevel(2);
