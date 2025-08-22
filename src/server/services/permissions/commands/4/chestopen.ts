import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("chop")
    .setDescription("<id> <amount> : Open a chest by its ID. Specify amount to roll a specific amount of times.")
    .setExecute((_o, id, amount) => {
        CommandAPI.Chest.openChest(id, tonumber(amount) ?? 5);
    })
    .setPermissionLevel(4);