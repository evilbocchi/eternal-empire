import { Server } from "shared/api/APIExpose";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import TierDifficulty from "shared/item/TierDifficulty";
import Gear from "shared/item/traits/Gear";
import Packets from "shared/Packets";

const REWARD_SECONDS = 30;

export = new Item(script.Name)
    .setName("Candy Research Kit")
    .setDescription("A celebratory bundle from the Difficulty Researcher with a sugary, energizing aroma.")
    .setDifficulty(TierDifficulty.Tier1)
    .setImage(getAsset("assets/CandyResearchKit.png"))
    .setLayoutOrder(99)
    .trait(Gear)
    .setOnUse(({ item, tool }) => {
        const revenue = Server.Currency.getOfflineRevenue().mul(REWARD_SECONDS);
        if (revenue.amountPerCurrency.size() > 0) {
            Server.Currency.incrementAll(revenue.amountPerCurrency);
            Packets.showDifference.toAllClients(revenue.amountPerCurrency);
            Server.Currency.propagate();
        }

        Server.Item.setItemAmount(item.id, 0);
        playSound("Consume.mp3");

        tool.Destroy();
        return true;
    })
    .exit();
