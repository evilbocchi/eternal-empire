import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("ui")
    .setDescription(
        "<item> <pot> : Give a unique item to the player. Specify pot value (0-100) to set a specific value for all pots.",
    )
    .setExecute((_o, item, pot) => {
        CommandAPI.Item.createUniqueInstance(item, tonumber(pot));
    })
    .setPermissionLevel(4);
