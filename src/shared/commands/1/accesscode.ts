import { RunService } from "@rbxts/services";
import Command, { CommandAPI } from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("ac")
    .setDescription(
        "View the access code for this empire. Anyone with the access code is able to join this empire. Only available for private empires.",
    )
    .setExecute((o) => {
        if (RunService.IsStudio() || (game.PrivateServerOwnerId === 0 && game.PrivateServerId !== "")) {
            const code = CommandAPI.Permissions.getAccessCode();
            CommandAPI.ChatHook.sendPrivateMessage(o, "The server access code is: " + code);
            Packets.codeReceived.toClient(o, code);
        } else {
            CommandAPI.ChatHook.sendPrivateMessage(o, "You cannot use this command on this server", "color:255,43,43");
        }
    })
    .setPermissionLevel(1);
