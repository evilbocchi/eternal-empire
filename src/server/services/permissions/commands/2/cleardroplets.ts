import { DROPLET_STORAGE } from "shared/item/Droplet";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("cd")
    .setDescription("Delete ALL droplets in ALL areas.")
    .setExecute((_o) => {
        for (const droplet of DROPLET_STORAGE.GetChildren()) if (droplet.IsA("BasePart")) droplet.Destroy();
        CommandAPI.ChatHook.sendServerMessage("Deleted all droplets");
    })
    .setPermissionLevel(2);
