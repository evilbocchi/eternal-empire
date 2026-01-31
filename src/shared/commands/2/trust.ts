import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("t")
    .setDescription("<player> <useId: boolean> : Trusts a player, giving them a permission level of 1.")
    .setExecute((o, p, useId) => {
        const userId = Server.Command.id(p, useId);
        if (userId !== undefined) {
            const success = Server.Permissions.add("trusted", userId);
            if (success) {
                Server.ChatHook.sendPrivateMessage(o, `Trusted ${Server.Command.fp(p, userId)}`, "color:138,255,138");
            } else {
                Server.ChatHook.sendPrivateMessage(
                    o,
                    `${Server.Command.fp(p, userId)} is already trusted`,
                    "color:255,43,43",
                );
            }
            Server.Permissions.updatePermissionLevel(userId);
        }
    })
    .setPermissionLevel(2);
