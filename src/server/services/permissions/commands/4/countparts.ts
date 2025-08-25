import { Workspace } from "@rbxts/services";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("getpartcount")
    .setDescription("Get the part count of the current world.")
    .setExecute(() => {
        let i = 0;
        for (const part of Workspace.GetDescendants())
            if (part.IsA("BasePart"))
                i++;
        CommandAPI.ChatHook.sendServerMessage("Part count: " + i);
    })
    .setPermissionLevel(4);