import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command("printdata")
    .addAlias("pd")
    .setDescription("Print game data to console.")
    .setExecute((_o) => print(CommandAPI.Data.empireData))
    .setPermissionLevel(4);