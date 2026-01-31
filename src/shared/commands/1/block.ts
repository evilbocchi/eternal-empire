import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("ignore")
    .setDescription(
        "<player> <useid: boolean> : Stop listening to the specified player's global chats. This affects the entire server.",
    )
    .setExecute((_o, p, useId) => {
        const userId = Server.Command.id(p, useId);
        if (userId !== undefined) {
            Server.empireData.blocking.add(userId);
            Server.ChatHook.sendServerMessage("Ignoring " + Server.Command.fp(p, userId), "color:138,255,138");
        }
    })
    .setPermissionLevel(1);
