import { Debris, Players } from "@rbxts/services";
import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("vr")
    .setDescription("<player> : Vote to restrict a player.")
    .setExecute((sender, p) => {
        if (sender === undefined) {
            warn("voterestrict command can only be run by a player.");
            return;
        }

        const targets = CommandAPI.Command.findPlayers(sender, p);
        if (targets.size() < 1) {
            CommandAPI.ChatHook.sendPrivateMessage(sender, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        const data = CommandAPI.empireData;
        const playerCount = Players.GetPlayers()
            .filter((player) => CommandAPI.Permissions.getPermissionLevel(player.UserId) > -1)
            .size();
        for (const target of targets) {
            const userId = target.UserId;
            if (CommandAPI.Permissions.getPermissionLevel(userId) >= 1) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    "You can't vote to restrict a trusted player",
                    "color:255,43,43",
                );
                continue;
            }
            if (sender.FindFirstChild(userId) !== undefined) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    "You have already voted to restrict this player",
                    "color:255,43,43",
                );
                continue;
            }
            const votes = ((target.GetAttribute("Votes") as number) ?? 0) + 1;
            target.SetAttribute("Votes", votes);
            if (votes === 0) {
                CommandAPI.ChatHook.sendServerMessage(
                    `A vote has started to restrict player ${target.Name}. Type /vr ${target.Name} to vote to restrict them too.`,
                    "color:138,255,138",
                );
            }
            const requirement = math.round((playerCount * 2) / 3);
            CommandAPI.ChatHook.sendServerMessage(`${votes}/${requirement} votes needed.`, "color:138,255,138");
            const voteToken = new Instance("NumberValue");
            voteToken.Value = tick();
            voteToken.Name = tostring(userId);
            voteToken.Parent = sender;
            Debris.AddItem(voteToken, 60);
            task.delay(60, () => {
                if (target === undefined) {
                    return;
                }
                target.SetAttribute("Votes", (target.GetAttribute("Votes") as number) - 1);
                if ((target.GetAttribute("RestrictionTime") as number) ?? 0 < tick()) {
                    CommandAPI.ChatHook.sendPrivateMessage(
                        sender,
                        `Your vote to restrict ${target.Name} has worn off.`,
                        "color:138,255,138",
                    );
                }
            });
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                `Voted to restrict ${target.Name}. Your vote will wear off after 60 seconds.`,
                "color:138,255,138",
            );
            if (votes >= requirement) {
                CommandAPI.ChatHook.sendServerMessage(
                    `${target.Name} has been restricted for 20 minutes.`,
                    "color:138,255,138",
                );
                data.restricted.set(userId, tick() + 1200);
                task.delay(1201, () => {
                    const t = data.restricted.get(userId);
                    if (t === undefined || tick() - t > 0) {
                        data.restricted.delete(userId);
                        CommandAPI.Permissions.updatePermissionLevel(userId);
                    }
                });
                CommandAPI.Permissions.updatePermissionLevel(userId);
            }
        }
    })
    .setPermissionLevel(0);
