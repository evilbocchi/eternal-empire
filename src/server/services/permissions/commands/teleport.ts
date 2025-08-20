import { Players } from "@rbxts/services";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command("teleport")
    .addAlias("tp")
    .setDescription("<teleporter> <to> : Teleport players to a target player.")
    .setExecute((o, p, t) => {
        const findPlayers = (sender: Player, str: string) => {
            switch (str) {
                case "me":
                    return [sender];
                case "others":
                    return Players.GetPlayers().filter((value) => value !== sender);
                case "all":
                    return Players.GetPlayers();
                case undefined:
                    return [];
                default:
                    for (const player of Players.GetPlayers()) {
                        if (str.lower() === player.Name.lower().sub(1, str.size())) {
                            return [player];
                        }
                    }
                    break;
            }
            return [];
        };

        const teleporters = findPlayers(o, p);
        const targets = findPlayers(o, t);
        const size = targets.size();
        if (size === 0) {
            CommandAPI.ChatHook.sendPrivateMessage(o, `No target called ${t} found`, "color:255,43,43");
            return;
        }
        else if (size > 1) {
            CommandAPI.ChatHook.sendPrivateMessage(o, `Too many targets specified: ${t}`, "color:255,43,43");
            return;
        }
        const target = targets[0];
        const destination = target.Character?.GetPivot();
        if (destination === undefined)
            return;
        for (const teleporter of teleporters) {
            if (CommandAPI.Permissions.getPermissionLevel(teleporter.UserId) > CommandAPI.Permissions.getPermissionLevel(o.UserId)) {
                CommandAPI.ChatHook.sendPrivateMessage(o, `You cannot teleport a player with a permission level higher than your own`, "color:255,43,43");
                continue;
            }
            teleporter.Character?.PivotTo(destination);
        }
        CommandAPI.ChatHook.sendPrivateMessage(o, `Teleported ${p} to ${t}`, "color:138,255,138");
    })
    .setPermissionLevel(2);