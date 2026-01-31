import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";
import AvailableEmpire from "shared/data/AvailableEmpire";

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
                Server.ChatHook.sendPrivateMessage(
                    sender,
                    `Please wait ${math.round(5 - (now - last))}s before inviting again.`,
                    "color:255,200,43",
                );
                return;
            }
            debounce.set(sender.UserId, now);
        }

        const userId = Server.Command.id(target, useId);
        if (userId !== undefined) {
            if (Server.Permissions.isLowerLevel(sender, userId)) {
                Server.ChatHook.sendPrivateMessage(
                    sender,
                    "You can't revoke someone with an equal/higher permission level.",
                    "color:255,43,43",
                );
                return;
            }
            const empireId = Server.Data.empireId;
            AvailableEmpire.remove(userId, empireId);
            Server.ChatHook.sendPrivateMessage(
                sender,
                `Revoked ${Server.Command.fp(target, userId)}`,
                "color:138,255,138",
            );
        }
    })
    .setPermissionLevel(1);
