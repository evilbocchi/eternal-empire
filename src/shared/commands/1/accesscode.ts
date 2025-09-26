import Command, { CommandAPI } from "shared/commands/Command";
import { IS_STUDIO } from "shared/Context";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("ac")
    .setDescription(
        "View the access code for this empire. Anyone with the access code is able to join this empire. Only available for private empires.",
    )
    .setExecute((sender) => {
        if (IS_STUDIO || (game.PrivateServerOwnerId === 0 && game.PrivateServerId !== "")) {
            const code = CommandAPI.Permissions.getAccessCode();
            CommandAPI.ChatHook.sendPrivateMessage(sender, "The server access code is: " + code);
            if (sender !== undefined) {
                Packets.codeReceived.toClient(sender, code);
            } else {
                Packets.codeReceived.toAllClients(code);
            }
        } else {
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                "You cannot use this command on this server",
                "color:255,43,43",
            );
        }
    })
    .setPermissionLevel(1);
