import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("la")
    .setDescription("<area> : Lock an area.")
    .setExecute((_o, area) => {
        Server.Area.lockArea(area as AreaId);
    })
    .setPermissionLevel(4);
