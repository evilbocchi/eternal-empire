import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("updatelbs")
    .setDescription("Refreshes leaderboard stats.")
    .setExecute(() => {
        Server.Leaderboard.debug = true;
        Server.Leaderboard.updateLeaderboards();
        Server.Leaderboard.debug = false;
    })
    .setPermissionLevel(4);
