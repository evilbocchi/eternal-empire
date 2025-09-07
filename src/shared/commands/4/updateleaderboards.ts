import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("updatelbs")
    .setDescription("Refreshes leaderboard stats.")
    .setExecute(() => {
        CommandAPI.Leaderboard.debug = true;
        CommandAPI.Leaderboard.updateLeaderboards();
        CommandAPI.Leaderboard.debug = false;
    })
    .setPermissionLevel(4);
