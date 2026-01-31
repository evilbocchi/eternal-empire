import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("ut")
    .setDescription("<player> <useId: boolean> : Untrusts a player, revoking both their trust and manager status.")
    .setExecute((o, p, useId) => {
        const userId = Server.Command.id(p, useId);
        if (userId !== undefined) {
            const success1 = Server.Permissions.remove("trusted", userId);
            const success2 = Server.Permissions.remove("managers", userId);
            if (success1 || success2) {
                Server.ChatHook.sendPrivateMessage(o, `Untrusted ${Server.Command.fp(p, userId)}`, "color:138,255,138");
            } else {
                Server.ChatHook.sendPrivateMessage(
                    o,
                    `${Server.Command.fp(p, userId)} is not trusted/a manager`,
                    "color:255,43,43",
                );
            }
            Server.Permissions.updatePermissionLevel(userId);
        }
    })
    .setPermissionLevel(2);
