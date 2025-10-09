import { Server } from "shared/api/APIExpose";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Gear from "shared/item/traits/Gear";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";

const REWARD_SECONDS = 30;

export = new Item(script.Name)
    .setName("Candy Research Kit")
    .setDescription("A celebratory bundle from the Difficulty Researcher with a sugary, energizing aroma.")
    .setDifficulty(TierDifficulty.Tier1)
    .setImage(getAsset("assets/CandyResearchKit.png"))
    .setLayoutOrder(99)
    .trait(Gear)
    .setOnUse(({ item, tool }) => {
        const fundsGain = Server.Currency.getOfflineRevenue().mul(REWARD_SECONDS).get("Funds");
        if (fundsGain === undefined || fundsGain.lessEquals(0)) {
            return false;
        }

        const revenue = new CurrencyBundle().set("Funds", fundsGain);
        Server.Currency.incrementAll(revenue.amountPerCurrency);
        Packets.showDifference.toAllClients(revenue.amountPerCurrency);
        Server.Currency.propagate();

        Server.Item.setItemAmount(item.id, 0);
        playSound("Consume.mp3");

        tool.Destroy();
        return true;
    })
    .exit();
