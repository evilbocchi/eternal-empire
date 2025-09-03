import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("la")
    .setDescription("<area> : Lock an area.")
    .setExecute((_o, area) => {
        CommandAPI.UnlockedAreas.lockArea(area as AreaId);
    })
    .setPermissionLevel(4);
