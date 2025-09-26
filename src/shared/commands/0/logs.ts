import Command from "shared/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("log")
    .setDescription("Open the log window, where activities from every player are recorded.")
    .setExecute((sender) => {
        if (sender === undefined) {
            Packets.tabOpened.toAllClients("Logs");
            return;
        }
        Packets.tabOpened.toClient(sender, "Logs");
    })
    .setPermissionLevel(0);
