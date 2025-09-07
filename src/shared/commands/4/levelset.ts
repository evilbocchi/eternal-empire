import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("lset")
    .setDescription("<amount> : Set the empire's level.")
    .setExecute((_o, amount) => {
        const a = tonumber(amount) ?? 0;
        CommandAPI.Level.setLevel(a);
    })
    .setPermissionLevel(4);
