import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("dws")
    .setDescription("<player> <amount> : Speeeeed.")
    .setExecute((o, p, a) => {
        const walkspeed = tonumber(a) ?? 0;
        const players = CommandAPI.Command.findPlayers(o, p);
        for (const player of players) {
            const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
            if (humanoid !== undefined) {
                humanoid.WalkSpeed = walkspeed;
            }
        }
    })
    .setPermissionLevel(4);