import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("rv")
    .setDescription("<player> : Removes the player's access to join the empire.")
    .setExecute((o, p, useId) => {
        const userId = CommandAPI.Command.id(p, useId);
        if (userId !== undefined) {
            if (
                CommandAPI.Permissions.getPermissionLevel(userId) >= CommandAPI.Permissions.getPermissionLevel(o.UserId)
            ) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    o,
                    "You can't revoke someone with an equal/higher permission level.",
                    "color:255,43,43",
                );
                return;
            }
            const empireId = CommandAPI.Data.empireId;
            CommandAPI.Data.removeAvailableEmpire(userId, empireId);
            CommandAPI.ChatHook.sendPrivateMessage(
                o,
                `Revoked ${CommandAPI.Command.fp(p, userId)}`,
                "color:138,255,138",
            );
        }
    })
    .setPermissionLevel(1);
