import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("ei")
    .setDescription("View the empire ID for this empire. Only useful for diagnostics.")
    .setExecute((sender) => {
        const id = Server.Data.empireId;
        Server.ChatHook.sendPrivateMessage(sender, "The empire ID is: " + id);
        if (sender !== undefined) {
            Packets.codeReceived.toClient(sender, id);
        } else {
            Packets.codeReceived.toAllClients(id);
        }
    })
    .setPermissionLevel(1);
