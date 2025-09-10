import Command from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("statistics")
    .setDescription("Open the statistics window, where you can view various game stats.")
    .setExecute((o) => {
        Packets.tabOpened.toClient(o, "Stats");
    })
    .setPermissionLevel(0);
