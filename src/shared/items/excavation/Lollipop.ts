import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Aquamarine from "shared/items/excavation/Aquamarine";

export = new Item(script.Name)
    .setName("Lollipop")
    .setDescription(
        "A sugary crystalline deposit formed in abandoned candy caverns. Surprisingly durable despite its flavor.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Aquamarine, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
