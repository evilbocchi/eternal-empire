import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("upgset")
    .setDescription("<upgrade> <amount> : Set the quantity for an upgrade.")
    .setExecute((_o, upgrade, amount) => {
        CommandAPI.NamedUpgrade.setUpgradeAmount(upgrade, tonumber(amount) ?? 0);
    })
    .setPermissionLevel(4);
