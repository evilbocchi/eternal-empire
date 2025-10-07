import Command, { CommandAPI } from "shared/commands/Command";
import AvailableEmpire from "shared/data/AvailableEmpire";
import ThisEmpire from "shared/data/ThisEmpire";

const debounce = new Map<number, number>();

export = new Command(script.Name)
    .addAlias("rv")
    .setDescription("<player> : Removes the player's access to join the empire.")
    .setExecute((sender, target, useId) => {
        // Debounce check
        if (sender) {
            const now = os.clock();
            const last = debounce.get(sender.UserId) ?? 0;
            if (now - last < 5) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    `Please wait ${math.round(5 - (now - last))}s before inviting again.`,
                    "color:255,200,43",
                );
                return;
            }
            debounce.set(sender.UserId, now);
        }

        const userId = CommandAPI.Command.id(target, useId);
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
                `Revoked ${CommandAPI.Command.fp(target, userId)}`,
                "color:138,255,138",
            );
        }
    })
    .setPermissionLevel(1);
