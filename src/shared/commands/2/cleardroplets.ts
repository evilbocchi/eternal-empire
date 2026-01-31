import { CollectionService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("cd")
    .setDescription("Delete ALL droplets in ALL areas.")
    .setExecute((_o) => {
        for (const droplet of CollectionService.GetTagged("Droplet")) if (droplet.IsA("BasePart")) droplet.Destroy();
        Server.ChatHook.sendServerMessage("Deleted all droplets");
    })
    .setPermissionLevel(2);
