import Command, { CommandAPI } from "shared/commands/Command";
import fixDuplicatedItemsData from "shared/data/loading/fixDuplicatedItemsData";

export = new Command(script.Name)
    .addAlias("undupe")
    .setDescription("Unduplicate all items in the world.")
    .setExecute((_player) => {
        fixDuplicatedItemsData(CommandAPI.empireData.items);
        CommandAPI.Item.fullUpdatePlacedItemsModels();
    })
    .setPermissionLevel(4);
