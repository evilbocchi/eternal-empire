import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";

export = new Item(script.Name)
    .setName("Uranium")
    .setDescription(
        "A dense, radioactive ore that hums with latent power. Integral to reactor cores and questionable science projects.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
