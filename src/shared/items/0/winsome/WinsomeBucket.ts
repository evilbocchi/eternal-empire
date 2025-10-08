import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import SkillPod from "shared/items/0/millisecondless/SkillPod";
import WinsomeSpeck from "shared/items/0/winsome/WinsomeSpeck";

export = new Item(script.Name)
    .setName("Winsome Bucket")
    .setDescription(
        "I don't even know why you need a bucket of Winsome. Just know that it exists and is there to emotionally support you.",
    )
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Funds", 1), 1)
    .setRequiredItemAmount(WinsomeSpeck, 10)
    .setRequiredItemAmount(SkillPod, 1)
    .soldAt(MagicalCraftingTable);
