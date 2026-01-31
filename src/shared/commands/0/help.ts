import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("?")
    .setDescription("Displays all available commands.")
    .setExecute((sender) => {
        if (sender === undefined) {
            Packets.tabOpened.toAllClients("Commands");
            return;
        }

        Server.ChatHook.sendPrivateMessage(
            sender,
            `Your permission level is ${Server.Permissions.getPermissionLevel(sender.UserId)}`,
            "color:138,255,138",
        );
        Packets.tabOpened.toClient(sender, "Commands");
    })
    .setPermissionLevel(0);
