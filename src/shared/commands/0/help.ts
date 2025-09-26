import Command, { CommandAPI } from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("?")
    .setDescription("Displays all available commands.")
    .setExecute((sender) => {
        if (sender === undefined) {
            Packets.tabOpened.toAllClients("Commands");
            return;
        }

        CommandAPI.ChatHook.sendPrivateMessage(
            sender,
            `Your permission level is ${CommandAPI.Permissions.getPermissionLevel(sender.UserId)}`,
            "color:138,255,138",
        );
        Packets.tabOpened.toClient(sender, "Commands");
    })
    .setPermissionLevel(0);
