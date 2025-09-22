import Command, { CommandAPI } from "shared/commands/Command";
import ThisEmpire from "shared/data/ThisEmpire";

export = new Command(script.Name)
    .addAlias("ignore")
    .setDescription(
        "<player> <useid: boolean> : Stop listening to the specified player's global chats. This affects the entire server.",
    )
    .setExecute((_o, p, useId) => {
        const userId = CommandAPI.Command.id(p, useId);
        if (userId !== undefined) {
            ThisEmpire.data.blocking.add(userId);
            CommandAPI.ChatHook.sendServerMessage("Ignoring " + CommandAPI.Command.fp(p, userId), "color:138,255,138");
        }
    })
    .setPermissionLevel(1);
