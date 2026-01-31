import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("r")
    .setDescription(
        "<player> <multiplier> : Restricts a player, removing their access to build and purchase permissions. Pass a multiplier to multiply the default 5 minute duration.",
    )
    .setExecute((sender, p, m) => {
        const targets = Server.Command.findPlayers(sender, p);
        if (targets.size() < 1) {
            Server.ChatHook.sendPrivateMessage(sender, `Could not find matching players ${p}`, "color:255,43,43");
            return;
        }
        const data = Server.empireData;
        const duration = 5 * (m === undefined ? 1 : (tonumber(m) ?? 1));
        for (const target of targets) {
            if (target === sender) {
                Server.ChatHook.sendPrivateMessage(sender, "You can't restrict yourself.", "color:255,43,43");
                continue;
            }
            const userId = target.UserId;
            if (Server.Permissions.isLowerLevel(sender, userId)) {
                Server.ChatHook.sendPrivateMessage(
                    sender,
                    "You can't restrict someone with an equal/higher permission level.",
                    "color:255,43,43",
                );
                continue;
            }
            Server.ChatHook.sendPrivateMessage(sender, `Restricted player ${target.Name}`, "color:138,255,138");
            const restrictionTime = tick() + duration * 60;
            target.SetAttribute("RestrictionTime", restrictionTime);
            data.restricted.set(userId, restrictionTime);
            task.delay(duration * 60, () => {
                data.restricted.delete(userId);
                Server.Permissions.updatePermissionLevel(userId);
            });
            Server.Permissions.updatePermissionLevel(userId);
        }
    })
    .setPermissionLevel(2);
