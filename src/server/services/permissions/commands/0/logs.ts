import Command from "server/services/permissions/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("log")
    .setDescription("Open the log window, where activities from every player are recorded.")
    .setExecute((o) => {
        Packets.tabOpened.toClient(o, "Logs");
    })
    .setPermissionLevel(0);