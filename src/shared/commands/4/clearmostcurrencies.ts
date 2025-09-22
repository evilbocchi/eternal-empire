import Command, { CommandAPI } from "shared/commands/Command";
import ThisEmpire from "shared/data/ThisEmpire";

export = new Command(script.Name)
    .addAlias("cmc")
    .setDescription("Clears all most currencies and leaderboard data of the server.")
    .setExecute(() => {
        ThisEmpire.data.mostCurrencies.clear();
        CommandAPI.Leaderboard.updateLeaderboards();
    })
    .setPermissionLevel(4);
