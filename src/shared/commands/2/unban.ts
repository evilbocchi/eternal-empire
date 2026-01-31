import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("ub")
    .setDescription("<player> <useId: boolean> : Unbans a player from the server.")
    .setExecute((o, p, useId) => {
        const userId = Server.Command.id(p, useId);
        if (userId !== undefined) {
            const success = Server.Permissions.remove("banned", userId);
            if (success) {
                Server.ChatHook.sendPrivateMessage(o, `Unbanned ${Server.Command.fp(p, userId)}`, "color:138,255,138");
            } else {
                Server.ChatHook.sendPrivateMessage(
                    o,
                    `${Server.Command.fp(p, userId)} is not banned`,
                    "color:255,43,43",
                );
            }
        }
    })
    .setPermissionLevel(2);
