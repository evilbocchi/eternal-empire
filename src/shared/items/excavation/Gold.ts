import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Iron from "shared/items/excavation/Iron";

export = new Item(script.Name)
    .setName("Gold")
    .setDescription(
        "A precious metal mostly used to flaunt wealth. Has many uses in science, but very expensive to harvest and produce.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Skill", 1))
    .setRequiredItemAmount(Iron, 256)
    .placeableEverywhere()
    .persists();
