import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("upgset")
    .setDescription("<upgrade> <amount> : Set the quantity for an upgrade.")
    .setExecute((_o, upgrade, amount) => {
        Server.NamedUpgrade.setUpgradeAmount(upgrade, tonumber(amount) ?? 0);
    })
    .setPermissionLevel(4);
