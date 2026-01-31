import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("chop")
    .setDescription("<id> <amount> : Open a chest by its ID. Specify amount to roll a specific amount of times.")
    .setExecute((_o, id, amount) => {
        Server.Chest.openChest(id, tonumber(amount) ?? 5);
    })
    .setPermissionLevel(4);
