import { AssetService } from "@rbxts/services";
import Command, { CommandAPI } from "shared/commands/Command";
import getPlayerBackpack from "shared/hamster/getPlayerBackpack";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";

export = new Command(script.Name)
    .addAlias("rbxt")
    .setDescription(
        "<player> <id> - Gives the specified player a Roblox tool by asset ID. Default ID is the classic Roblox sword.",
    )
    .setExecute((sender, target, providedId) => {
        const assetId = tonumber(providedId) ?? 47433;

        const asset = AssetService.LoadAssetAsync(assetId);

        if (!asset) {
            warn(`Robloxtool command: could not load asset with ID ${assetId}`);
            return;
        }

        const players = CommandAPI.Command.findPlayers(sender, target);
        for (const player of players) {
            for (const child of asset.GetChildren()) {
                child.Clone().Parent = getPlayerCharacter(player);
            }
        }
    })
    .setPermissionLevel(4);
