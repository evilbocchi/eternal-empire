import Command, { CommandAPI } from "shared/commands/Command";
import ThisEmpire from "shared/data/ThisEmpire";

export = new Command(script.Name)
    .addAlias("truewipedata")
    .setDescription("Reset all data like no progress was ever made.")
    .setExecute((_o) => {
        CommandAPI.Item.setPlacedItems(new Map());
        ThisEmpire.data.items.bought.clear();
        ThisEmpire.data.items.inventory.clear();
        ThisEmpire.data.items.inventory.set("ClassLowerNegativeShop", 1);
        ThisEmpire.data.quests.clear();
        CommandAPI.Item.fullUpdatePlacedItemsModels();
        CommandAPI.Currency.setAll(new Map());
        CommandAPI.NamedUpgrade.setAmountPerUpgrade(new Map());
        CommandAPI.Playtime.setPlaytime(0);
        CommandAPI.Level.setLevel(1);
        CommandAPI.Level.setXp(0);
        CommandAPI.ChatHook.sendServerMessage("True reset complete. The shop is in your inventory.");
        CommandAPI.Item.requestChanges();
    })
    .setPermissionLevel(4);
