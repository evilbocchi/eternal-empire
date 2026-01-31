import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("cmc")
    .setDescription("Clears all most currencies and leaderboard data of the server.")
    .setExecute(() => {
        Server.empireData.mostCurrencies.clear();
        Server.Leaderboard.updateLeaderboards();
    })
    .setPermissionLevel(4);
