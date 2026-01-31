import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("pd")
    .setDescription("Print game data to console.")
    .setExecute((_o) => print(Server.empireData))
    .setPermissionLevel(4);
