import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("pd")
    .setDescription("Print game data to console.")
    .setExecute((_o) => print(CommandAPI.empireData))
    .setPermissionLevel(4);
