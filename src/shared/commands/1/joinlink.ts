import { RunService } from "@rbxts/services";
import Command, { CommandAPI } from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("jl")
    .setDescription(
        "Gets a URL in which players can use to join this empire. Utilises the empire's access code. Only available for private empires.",
    )
    .setExecute((o) => {
        if (RunService.IsStudio() || (game.PrivateServerOwnerId === 0 && game.PrivateServerId !== "")) {
            const joinLink = `https://www.roblox.com/games/start?placeId=${game.PlaceId}&launchData=${CommandAPI.Permissions.getAccessCode()}`;
            CommandAPI.ChatHook.sendPrivateMessage(o, "Join link: " + joinLink);
            Packets.codeReceived.toClient(o, joinLink);
        } else {
            CommandAPI.ChatHook.sendPrivateMessage(o, "You cannot use this command on this server", "color:255,43,43");
        }
    })
    .setPermissionLevel(1);
