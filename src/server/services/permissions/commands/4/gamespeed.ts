import Command, { CommandAPI } from "server/services/permissions/commands/Command";
import GameSpeed from "shared/GameSpeed";

export = new Command(script.Name)
    .addAlias("gs")
    .setDescription("Set how fast the game runs. Default is 1.")
    .setExecute((_player, newSpeed) => {
        const speed = tonumber(newSpeed) ?? 1;
        CommandAPI.ChatHook.sendServerMessage(`Changed speed to ${speed}. Old speed: ${GameSpeed.speed}`);
        GameSpeed.speed = speed;
    })
    .setPermissionLevel(4);
