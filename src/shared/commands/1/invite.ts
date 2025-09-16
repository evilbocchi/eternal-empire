import Command, { CommandAPI } from "shared/commands/Command";
import { IS_STUDIO } from "shared/Context";

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
            CommandAPI.Data.addAvailableEmpire(userId, CommandAPI.Data.empireId);
            CommandAPI.ChatHook.sendPrivateMessage(
                o,
                "Invited " + CommandAPI.Command.fp(p, userId),
                "color:138,255,138",
            );
        }
    })
    .setPermissionLevel(1);
