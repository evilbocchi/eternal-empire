import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("ut")
    .setDescription("<player> <useId: boolean> : Untrusts a player, revoking both their trust and manager status.")
    .setExecute((o, p, useId) => {
        const userId = CommandAPI.Command.id(p, useId);
        if (userId !== undefined) {
            const success1 = CommandAPI.Permissions.remove("trusted", userId);
            const success2 = CommandAPI.Permissions.remove("managers", userId);
            if (success1 || success2) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    o,
                    `Untrusted ${CommandAPI.Command.fp(p, userId)}`,
                    "color:138,255,138",
                );
            } else {
                CommandAPI.ChatHook.sendPrivateMessage(
                    o,
                    `${CommandAPI.Command.fp(p, userId)} is not trusted/a manager`,
                    "color:255,43,43",
                );
            }
            CommandAPI.Permissions.updatePermissionLevel(userId);
        }
    })
    .setPermissionLevel(2);
