import Command, { CommandAPI } from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("?")
    .setDescription("Displays all available commands.")
    .setExecute((o) => {
        CommandAPI.ChatHook.sendPrivateMessage(
            o,
            `Your permission level is ${CommandAPI.Permissions.getPermissionLevel(o.UserId)}`,
            "color:138,255,138",
        );
        Packets.tabOpened.toClient(o, "Commands");
    })
    .setPermissionLevel(0);
