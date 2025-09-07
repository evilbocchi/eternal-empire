import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("t")
    .setDescription("<player> <useId: boolean> : Trusts a player, giving them a permission level of 1.")
    .setExecute((o, p, useId) => {
        const userId = CommandAPI.Command.id(p, useId);
        if (userId !== undefined) {
            const success = CommandAPI.Permissions.add("trusted", userId);
            if (success) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    o,
                    `Trusted ${CommandAPI.Command.fp(p, userId)}`,
                    "color:138,255,138",
                );
            } else {
                CommandAPI.ChatHook.sendPrivateMessage(
                    o,
                    `${CommandAPI.Command.fp(p, userId)} is already trusted`,
                    "color:255,43,43",
                );
            }
            CommandAPI.Permissions.updatePermissionLevel(userId);
        }
    })
    .setPermissionLevel(2);
