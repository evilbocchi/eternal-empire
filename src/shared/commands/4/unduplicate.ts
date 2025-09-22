import Command, { CommandAPI } from "shared/commands/Command";
import fixDuplicatedItemsData from "shared/data/loading/fixDuplicatedItemsData";
import ThisEmpire from "shared/data/ThisEmpire";

export = new Command(script.Name)
    .addAlias("undupe")
    .setDescription("Unduplicate all items in the world.")
    .setExecute((_player) => {
        fixDuplicatedItemsData(ThisEmpire.data.items);
        CommandAPI.Item.fullUpdatePlacedItemsModels();
    })
    .setPermissionLevel(4);
