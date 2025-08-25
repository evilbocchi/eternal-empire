import { Workspace } from "@rbxts/services";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("ws")
    .setDescription("<amount> : Sets your walk speed to the specified amount. If higher than the limit, it will be capped to the maximum allowed speed.")
    .setExecute((o, amount) => {
        let walkspeed = tonumber(amount);
        if (walkspeed !== undefined && walkspeed < 0) {
            CommandAPI.ChatHook.sendPrivateMessage(o, "Walk speed cannot be negative.", "color:255,43,43");
            return;
        }
        const maxWalkSpeed = Workspace.GetAttribute("WalkSpeed") as number ?? 16;
        walkspeed ??= 16;
        if (walkspeed > maxWalkSpeed) {
            CommandAPI.ChatHook.sendPrivateMessage(o, `Walk speed capped at ${maxWalkSpeed}.`, "color:255,43,43");
        }
        walkspeed = math.min(walkspeed, maxWalkSpeed);
        const humanoid = o.Character?.FindFirstChildOfClass("Humanoid");
        if (humanoid === undefined) {
            return;
        }
        humanoid.WalkSpeed = walkspeed;
        CommandAPI.ChatHook.sendPrivateMessage(o, `Walk speed set to ${walkspeed}.`, "color:138,255,138");
    })
    .setPermissionLevel(0);