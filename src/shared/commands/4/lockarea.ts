import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("la")
    .setDescription("<area> : Lock an area.")
    .setExecute((_o, area) => {
        CommandAPI.Area.lockArea(area as AreaId);
    })
    .setPermissionLevel(4);
