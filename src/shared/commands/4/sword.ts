import { ASSETS } from "shared/asset/GameAssets";
import Command from "shared/commands/Command";
import getPlayerBackpack from "shared/hamster/getPlayerBackpack";

export = new Command(script.Name)
    .addAlias("sw")
    .setDescription("Shank")
    .setExecute((sender) => {
        ASSETS.ClassicSword.Clone().Parent = getPlayerBackpack(sender);
    })
    .setPermissionLevel(4);
