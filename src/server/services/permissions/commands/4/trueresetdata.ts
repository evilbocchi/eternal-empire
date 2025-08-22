import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("truewipedata")
    .setDescription("Reset all data like no progress was ever made.")
    .setExecute((_o) => {
        CommandAPI.Item.setPlacedItems(new Map());
        CommandAPI.Data.empireData.items.bought.clear();
        CommandAPI.Data.empireData.items.inventory.clear();
        CommandAPI.Data.empireData.items.inventory.set("ClassLowerNegativeShop", 1);
        CommandAPI.Item.fullUpdatePlacedItemsModels();
        CommandAPI.Currency.setAll(new Map());
        CommandAPI.NamedUpgrade.setAmountPerUpgrade(new Map());
        CommandAPI.Playtime.setPlaytime(0);
        CommandAPI.Level.setLevel(1);
        CommandAPI.Level.setXp(0);
        CommandAPI.Quest.setStagePerQuest(new Map());
        CommandAPI.ChatHook.sendServerMessage("True reset complete. The shop is in your inventory.");
    })
    .setPermissionLevel(4);