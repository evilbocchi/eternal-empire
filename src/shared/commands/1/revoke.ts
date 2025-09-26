import Command, { CommandAPI } from "shared/commands/Command";
import AvailableEmpire from "shared/data/AvailableEmpire";
import ThisEmpire from "shared/data/ThisEmpire";

export = new Command(script.Name)
    .addAlias("rv")
    .setDescription("<player> : Removes the player's access to join the empire.")
    .setExecute((sender, p, useId) => {
        const userId = CommandAPI.Command.id(p, useId);
        if (userId !== undefined) {
            if (CommandAPI.Permissions.isLowerLevel(sender, userId)) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    "You can't revoke someone with an equal/higher permission level.",
                    "color:255,43,43",
                );
                return;
            }
            const empireId = ThisEmpire.id;
            AvailableEmpire.remove(userId, empireId);
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                `Revoked ${CommandAPI.Command.fp(p, userId)}`,
                "color:138,255,138",
            );
        }
    })
    .setPermissionLevel(1);
