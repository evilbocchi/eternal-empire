import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("cmc")
    .setDescription("Clears all most currencies and leaderboard data of the server.")
    .setExecute(() => {
        CommandAPI.empireData.mostCurrencies.clear();
        CommandAPI.Leaderboard.updateLeaderboards();
    })
    .setPermissionLevel(4);
