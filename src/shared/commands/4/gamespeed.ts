import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";
import GameSpeed from "shared/GameSpeed";

export = new Command(script.Name)
    .addAlias("gs")
    .setDescription("Set how fast the game runs. Default is 1.")
    .setExecute((_player, newSpeed) => {
        const speed = tonumber(newSpeed) ?? 1;
        Server.ChatHook.sendServerMessage(`Changed speed to ${speed}. Old speed: ${GameSpeed.speed}`);
        GameSpeed.speed = speed;
    })
    .setPermissionLevel(4);
