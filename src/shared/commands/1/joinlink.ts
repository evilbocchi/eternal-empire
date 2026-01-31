import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";
import { IS_STUDIO } from "shared/Context";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("jl")
    .setDescription(
        "Gets a URL in which players can use to join this empire. Utilises the empire's access code. Only available for private empires.",
    )
    .setExecute((sender) => {
        if (IS_STUDIO || (game.PrivateServerOwnerId === 0 && game.PrivateServerId !== "")) {
            const joinLink = `https://www.roblox.com/games/start?placeId=${game.PlaceId}&launchData=${Server.Permissions.getAccessCode()}`;
            Server.ChatHook.sendPrivateMessage(sender, "Join link: " + joinLink);
            if (sender !== undefined) {
                Packets.codeReceived.toClient(sender, joinLink);
            } else {
                Packets.codeReceived.toAllClients(joinLink);
            }
        } else {
            Server.ChatHook.sendPrivateMessage(sender, "You cannot use this command on this server", "color:255,43,43");
        }
    })
    .setPermissionLevel(1);
