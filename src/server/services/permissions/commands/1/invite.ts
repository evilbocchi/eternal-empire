import { RunService } from "@rbxts/services";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command("invite")
    .addAlias("inv")
    .setDescription("<player> : Allows the specified player to join this empire.")
    .setExecute((o, p, useId) => {
        const userId = CommandAPI.Command.id(p, useId);
        const isStudio = RunService.IsStudio();
        if (userId !== undefined && (userId !== o.UserId || isStudio)) {
            if (!isStudio && (game.PrivateServerOwnerId !== 0 || game.PrivateServerId === "")) {
                CommandAPI.ChatHook.sendPrivateMessage(o, "You cannot use /invite in this server.", "color:255,43,43");
                return;
            }
            CommandAPI.Data.addAvailableEmpire(userId, CommandAPI.Data.empireId);
            CommandAPI.ChatHook.sendPrivateMessage(o, "Invited " + CommandAPI.Command.fp(p, userId), "color:138,255,138");
        }
    })
    .setPermissionLevel(1);