
import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import { Server } from "shared/api/APIExpose";
import Packets from "shared/Packets";

export = new Item(script.Name)
    .setName("Purifiers' Dream")
    .setDescription(
        "An unfounded treasure meant solely for the mastery of purification, producing %val% droplets every 2 seconds.",
    )
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 9.9e21).set("Purifier Clicks", 8000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.PurifiersDroplet)
    .setDropRate(0.5)
    .onLoad((model: Model, item: Item) => {
        const dropper = item.trait(Dropper);
        dropper.onDropletProduced((droplet: BasePart, _dropperItem: Dropper) => {
            // Find the owner of the dropper
            const empireOwnerId = model.GetAttribute("EmpireOwner") as number | undefined;
            if (empireOwnerId !== undefined && empireOwnerId !== 0) {
                const player = game.GetService("Players").GetPlayerByUserId(empireOwnerId);
                if (player !== undefined) {
                    // Increment Purifier Clicks for the player
                    const CurrencyService = Server.Currency;
                    const data = Server.dataPerPlayer.get(player.UserId);
                    if (data !== undefined) {
                        const newRawClicks = ++data.rawPurifierClicks;
                        Packets.rawPurifierClicks.setFor(player, newRawClicks);
                        // Optionally, update balance as well
                        CurrencyService.increment("Purifier Clicks", new OnoeNum(1));
                    }
                }
            }
        });
    })
    .exit();
