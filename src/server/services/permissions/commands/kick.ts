import { playSoundAtPart, spawnExplosion } from "@antivivi/vrldk";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";
import { getSound } from "shared/asset/GameAssets";

export = new Command("kick")
    .addAlias("k")
    .setDescription("<player> : Kicks a player from the server.")
    .setExecute((o, p) => {
        const targets = CommandAPI.Command.findPlayers(o, p);
        if (targets.size() < 1) {
            CommandAPI.ChatHook.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        const kaboom = (player: Player) => {
            const h = player.Character?.FindFirstChildOfClass("Humanoid");
            if (h !== undefined && h.RootPart !== undefined) {
                spawnExplosion(h.RootPart.Position);
                playSoundAtPart(h.RootPart, getSound("Explosion.mp3"));
                h.TakeDamage(99999999);
            }
        };
        for (const target of targets) {
            if (target === o) {
                CommandAPI.ChatHook.sendPrivateMessage(o, "You can't kick yourself.", "color:255,43,43");
                continue;
            }
            if (CommandAPI.Permissions.getPermissionLevel(target.UserId) >= CommandAPI.Permissions.getPermissionLevel(o.UserId)) {
                CommandAPI.ChatHook.sendPrivateMessage(o, "You can't kick someone with an equal/higher permission level.", "color:255,43,43");
                continue;
            }
            CommandAPI.ChatHook.sendPrivateMessage(o, `Kicked player ${target.Name}`, "color:138,255,138");
            kaboom(target);
            task.delay(1, () => {
                if (target !== undefined) {
                    target.Kick("You were kicked by " + o.Name);
                }
            });
        }
    })
    .setPermissionLevel(2);