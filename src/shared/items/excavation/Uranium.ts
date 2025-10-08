import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Ion from "shared/items/excavation/Ion";

export = new Item(script.Name)
    .setName("Uranium")
    .setDescription(
        "A dense, radioactive ore that hums with latent power. Integral to reactor cores and questionable science projects.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Ion, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
