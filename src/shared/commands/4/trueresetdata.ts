import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("truewipedata")
    .setDescription("Reset all data like no progress was ever made.")
    .setExecute((_o) => {
        Server.Data.softWipe();
        Server.Item.fullUpdatePlacedItemsModels();
        Server.ChatHook.sendServerMessage("True reset complete. The shop is in your inventory.");
        Server.Item.requestChanges();
    })
    .setPermissionLevel(4);
