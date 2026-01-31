import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("man")
    .setDescription("<player> <useId: boolean> : Appoints a player as a manager, giving them a permission level of 2.")
    .setExecute((o, p, useId) => {
        const userId = Server.Command.id(p, useId);
        if (userId !== undefined) {
            const success = Server.Permissions.add("managers", userId);
            if (success) {
                Server.ChatHook.sendPrivateMessage(
                    o,
                    `${Server.Command.fp(p, userId)} is now a manager`,
                    "color:138,255,138",
                );
            } else {
                Server.ChatHook.sendPrivateMessage(
                    o,
                    `${Server.Command.fp(p, userId)} is already a manager`,
                    "color:255,43,43",
                );
            }
            Server.Permissions.updatePermissionLevel(userId);
        }
    })
    .setPermissionLevel(3);
