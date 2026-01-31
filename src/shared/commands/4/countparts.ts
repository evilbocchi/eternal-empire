import { Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("getpartcount")
    .setDescription("Get the part count of the current world.")
    .setExecute(() => {
        let i = 0;
        for (const part of Workspace.GetDescendants()) if (part.IsA("BasePart")) i++;
        Server.ChatHook.sendServerMessage("Part count: " + i);
    })
    .setPermissionLevel(4);
