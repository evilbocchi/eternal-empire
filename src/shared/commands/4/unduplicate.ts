import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";
import fixDuplicatedItemsData from "shared/data/loading/fixDuplicatedItemsData";

export = new Command(script.Name)
    .addAlias("undupe")
    .setDescription("Unduplicate all items in the world.")
    .setExecute((_player) => {
        fixDuplicatedItemsData(Server.empireData.items);
        Server.Item.fullUpdatePlacedItemsModels();
    })
    .setPermissionLevel(4);
