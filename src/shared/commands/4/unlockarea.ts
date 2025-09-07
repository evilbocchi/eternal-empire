import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("ula")
    .setDescription("<area> : Unlock an area.")
    .setExecute((_o, area) => {
        CommandAPI.UnlockedAreas.unlockArea(area as AreaId);
    })
    .setPermissionLevel(4);
