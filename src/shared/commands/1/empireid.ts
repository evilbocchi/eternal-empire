import Command, { CommandAPI } from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("ei")
    .setDescription("View the empire ID for this empire. Only useful for diagnostics.")
    .setExecute((o) => {
        const id = CommandAPI.Data.empireId;
        CommandAPI.ChatHook.sendPrivateMessage(o, "The empire ID is: " + id);
        Packets.codeReceived.toClient(o, id);
    })
    .setPermissionLevel(1);
