import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("tb")
    .setDescription("Toggle item breakdowns on or off.")
    .setPermissionLevel(4)
    .setExecute(() => {
        CommandAPI.Item.breakdownsEnabled = !CommandAPI.Item.breakdownsEnabled;
        if (CommandAPI.Item.breakdownsEnabled) {
            CommandAPI.ChatHook.sendServerMessage("Breakdowns have been enabled.");
            return;
        }
        CommandAPI.ChatHook.sendServerMessage("Breakdowns have been disabled.");
    });
