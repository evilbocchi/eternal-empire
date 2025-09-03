import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("undupe")
    .setDescription("Unduplicate all items in the world.")
    .setExecute((_player) => {
        CommandAPI.Data.dupeCheck(CommandAPI.Data.empireData.items);
        CommandAPI.Item.fullUpdatePlacedItemsModels();
    })
    .setPermissionLevel(4);
