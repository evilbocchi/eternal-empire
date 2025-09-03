import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("ub")
    .setDescription("<player> <useId: boolean> : Unbans a player from the server.")
    .setExecute((o, p, useId) => {
        const userId = CommandAPI.Command.id(p, useId);
        if (userId !== undefined) {
            const success = CommandAPI.Permissions.remove("banned", userId);
            if (success) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    o,
                    `Unbanned ${CommandAPI.Command.fp(p, userId)}`,
                    "color:138,255,138",
                );
            } else {
                CommandAPI.ChatHook.sendPrivateMessage(
                    o,
                    `${CommandAPI.Command.fp(p, userId)} is not banned`,
                    "color:255,43,43",
                );
            }
        }
    })
    .setPermissionLevel(2);
