import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("cmc")
    .setDescription("Clears all most currencies and leaderboard data of the server.")
    .setExecute(() => {
        CommandAPI.Data.empireData.mostCurrencies.clear();
        CommandAPI.Leaderboard.updateLeaderboards();
    })
    .setPermissionLevel(4);
