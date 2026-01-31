import { Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";

export = new Command(script.Name)
    .addAlias("ws")
    .setDescription(
        "<amount> : Sets your walk speed to the specified amount. If higher than the limit, it will be capped to the maximum allowed speed.",
    )
    .setExecute((sender, amount) => {
        let walkspeed = tonumber(amount);
        if (walkspeed !== undefined && walkspeed < 0) {
            Server.ChatHook.sendPrivateMessage(sender, "Walk speed cannot be negative.", "color:255,43,43");
            return;
        }
        const maxWalkSpeed = (Workspace.GetAttribute("WalkSpeed") as number) ?? 16;
        walkspeed ??= 16;
        if (walkspeed > maxWalkSpeed) {
            Server.ChatHook.sendPrivateMessage(sender, `Walk speed capped at ${maxWalkSpeed}.`, "color:255,43,43");
        }
        walkspeed = math.min(walkspeed, maxWalkSpeed);
        const humanoid = getPlayerCharacter(sender)?.FindFirstChildOfClass("Humanoid");
        if (humanoid === undefined) {
            return;
        }
        humanoid.WalkSpeed = walkspeed;
        Server.ChatHook.sendPrivateMessage(sender, `Walk speed set to ${walkspeed}.`, "color:138,255,138");
    })
    .setPermissionLevel(0);
