import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("truewipedata")
    .setDescription("Reset all data like no progress was ever made.")
    .setExecute((_o) => {
        CommandAPI.Data.softWipe();
        CommandAPI.Item.fullUpdatePlacedItemsModels();
        CommandAPI.ChatHook.sendServerMessage("True reset complete. The shop is in your inventory.");
        CommandAPI.Item.requestChanges();
    })
    .setPermissionLevel(4);
