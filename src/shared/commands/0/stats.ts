import Command from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("statistics")
    .setDescription("Open the statistics window, where you can view various game stats.")
    .setExecute((sender) => {
        if (sender === undefined) {
            Packets.tabOpened.toAllClients("Stats");
            return;
        }
        Packets.tabOpened.toClient(sender, "Stats");
    })
    .setPermissionLevel(0);
