import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("ula")
    .setDescription("<area> : Unlock an area.")
    .setExecute((_o, area) => {
        Server.Area.unlockArea(area as AreaId);
    })
    .setPermissionLevel(4);
