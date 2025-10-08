import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "../bonuses/ExcavationShop";

export = new Item(script.Name)
    .setName("Tetra")
    .setDescription(
        "A teal crystal growing naturally as perfect tetrahedrons. Engineers use it to align multi-axis droplet routes.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
