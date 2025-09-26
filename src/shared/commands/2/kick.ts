import { spawnExplosion } from "@antivivi/vrldk";
import { playSound } from "shared/asset/GameAssets";
import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("k")
    .setDescription("<player> : Kicks a player from the server.")
    .setExecute((sender, p) => {
        const targets = CommandAPI.Command.findPlayers(sender, p);
        if (targets.size() < 1) {
            CommandAPI.ChatHook.sendPrivateMessage(sender, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        const kaboom = (player: Player) => {
            const h = player.Character?.FindFirstChildOfClass("Humanoid");
            if (h !== undefined && h.RootPart !== undefined) {
                spawnExplosion(h.RootPart.Position);
                playSound("Explosion.mp3", h.RootPart);
                h.TakeDamage(99999999);
            }
        };
        for (const target of targets) {
            if (target === sender) {
                CommandAPI.ChatHook.sendPrivateMessage(sender, "You can't kick yourself.", "color:255,43,43");
                continue;
            }
            if (CommandAPI.Permissions.isLowerLevel(sender, target.UserId)) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    "You can't kick someone with an equal/higher permission level.",
                    "color:255,43,43",
                );
                continue;
            }
            CommandAPI.ChatHook.sendPrivateMessage(sender, `Kicked player ${target.Name}`, "color:138,255,138");
            kaboom(target);
            task.delay(1, () => {
                if (target !== undefined) {
                    target.Kick(`You were kicked by ${sender?.Name ?? "an administrator"}.`);
                }
            });
        }
    })
    .setPermissionLevel(2);
