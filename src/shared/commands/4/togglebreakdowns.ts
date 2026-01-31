import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("tb")
    .setDescription("Toggle item breakdowns on or off.")
    .setPermissionLevel(4)
    .setExecute(() => {
        Server.Item.breakdownsEnabled = !Server.Item.breakdownsEnabled;
        if (Server.Item.breakdownsEnabled) {
            Server.ChatHook.sendServerMessage("Breakdowns have been enabled.");
            return;
        }
        Server.ChatHook.sendServerMessage("Breakdowns have been disabled.");
    });
