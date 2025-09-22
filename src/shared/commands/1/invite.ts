import Command, { CommandAPI } from "shared/commands/Command";
import { IS_STUDIO } from "shared/Context";
import AvailableEmpire from "shared/data/AvailableEmpire";
import ThisEmpire from "shared/data/ThisEmpire";

export = new Command(script.Name)
    .addAlias("inv")
    .setDescription("<player> : Allows the specified player to join this empire.")
    .setExecute((o, p, useId) => {
        const userId = CommandAPI.Command.id(p, useId);
        if (userId !== undefined && (userId !== o.UserId || IS_STUDIO)) {
            if (!IS_STUDIO && (game.PrivateServerOwnerId !== 0 || game.PrivateServerId === "")) {
                CommandAPI.ChatHook.sendPrivateMessage(o, "You cannot use /invite in this server.", "color:255,43,43");
                return;
            }
            AvailableEmpire.add(userId, ThisEmpire.id);
            CommandAPI.ChatHook.sendPrivateMessage(
                o,
                "Invited " + CommandAPI.Command.fp(p, userId),
                "color:138,255,138",
            );
        }
    })
    .setPermissionLevel(1);
