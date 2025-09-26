import { Players } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("b")
    .setDescription("<player> <useId: boolean> : Bans a player from the server.")
    .setExecute((sender, p, useId) => {
        const targets = CommandAPI.Command.findPlayers(sender, p);
        if (targets.size() < 1) {
            const userId = useId === "true" ? tonumber(p) : Players.GetUserIdFromNameAsync(p);
            if (userId !== undefined) {
                if (CommandAPI.Permissions.isLowerLevel(sender, userId)) {
                    CommandAPI.ChatHook.sendPrivateMessage(
                        sender,
                        "You can't ban someone with an equal/higher permission level.",
                        "color:255,43,43",
                    );
                    return;
                }
                const success = CommandAPI.Permissions.add("banned", userId);
                if (success) {
                    CommandAPI.ChatHook.sendPrivateMessage(
                        sender,
                        `Banned ${CommandAPI.Command.fp(p, userId)}`,
                        "color:138,255,138",
                    );
                } else {
                    CommandAPI.ChatHook.sendPrivateMessage(
                        sender,
                        `${CommandAPI.Command.fp(p, userId)} is already banned`,
                        "color:255,43,43",
                    );
                }
                return;
            }
            CommandAPI.ChatHook.sendPrivateMessage(sender, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        for (const target of targets) {
            if (target === sender) {
                CommandAPI.ChatHook.sendPrivateMessage(sender, "You can't ban yourself.", "color:255,43,43");
                continue;
            }
            if (CommandAPI.Permissions.isLowerLevel(sender, target.UserId)) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    "You can't ban someone with an equal/higher permission level.",
                    "color:255,43,43",
                );
                continue;
            }
            CommandAPI.ChatHook.sendPrivateMessage(sender, `Banned player ${target.Name}`, "color:138,255,138");
            const h = target.Character?.FindFirstChildOfClass("Humanoid");
            if (h !== undefined && h.RootPart !== undefined) {
                const smoke = new Instance("Smoke");
                smoke.Size = 5;
                smoke.TimeScale = 20;
                smoke.Parent = h.RootPart;
                const attachment =
                    (h.RootPart.FindFirstChild("LVAttachment") as Attachment) ?? new Instance("Attachment", h.RootPart);
                attachment.Name = "LVAttachment";
                const vector = new Vector3(0, 300, 0);
                const linearVelocity = new Instance("LinearVelocity");
                linearVelocity.MaxForce = vector.Magnitude * 20000;
                linearVelocity.VectorVelocity = vector;
                linearVelocity.Attachment0 = attachment;
                linearVelocity.Parent = attachment;
                playSound("Rocket.mp3", h.RootPart);
            }
            CommandAPI.Permissions.add("banned", target.UserId);
            task.delay(1, () => {
                if (target !== undefined) {
                    target.Kick(`You were banned by ${sender?.Name ?? "an administrator"}.`);
                }
            });
        }
    })
    .setPermissionLevel(2);
