import Command, { CommandAPI } from "shared/commands/Command";
import { IS_STUDIO } from "shared/Context";
import AvailableEmpire from "shared/data/AvailableEmpire";

const debounce = new Map<number, number>();

export = new Command(script.Name)
    .addAlias("inv")
    .setDescription("<player> : Allows the specified player to join this empire.")
    .setExecute((sender, target, useId) => {
        const userId = CommandAPI.Command.id(target, useId);
        if (userId !== undefined && (userId !== sender?.UserId || IS_STUDIO)) {
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

            if (!IS_STUDIO && (game.PrivateServerOwnerId !== 0 || game.PrivateServerId === "")) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    "You cannot use /invite in this server.",
                    "color:255,43,43",
                );
                return;
            }
            AvailableEmpire.add(userId, CommandAPI.Data.empireId);
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                "Invited " + CommandAPI.Command.fp(target, userId),
                "color:138,255,138",
            );
        }
    })
    .setPermissionLevel(1);
