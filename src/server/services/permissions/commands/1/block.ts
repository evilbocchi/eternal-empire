import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command("block")
    .addAlias("ignore")
    .setDescription("<player> <useid: boolean> : Stop listening to the specified player's global chats. This affects the entire server.")
    .setExecute((_o, p, useId) => {
        const userId = CommandAPI.Command.id(p, useId);
        if (userId !== undefined) {
            CommandAPI.Data.empireData.blocking.add(userId);
            CommandAPI.ChatHook.sendServerMessage("Ignoring " + CommandAPI.Command.fp(p, userId), "color:138,255,138");
        }
    })
    .setPermissionLevel(1);