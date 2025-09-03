import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("pd")
    .setDescription("Print game data to console.")
    .setExecute((_o) => print(CommandAPI.Data.empireData))
    .setPermissionLevel(4);
