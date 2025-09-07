import { ASSETS } from "shared/asset/GameAssets";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("sw")
    .setDescription("Shank")
    .setExecute((o) => {
        ASSETS.ClassicSword.Clone().Parent = o.FindFirstChildOfClass("Backpack");
    })
    .setPermissionLevel(4);
