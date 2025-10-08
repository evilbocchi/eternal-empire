import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Orpiment from "shared/items/excavation/Orpiment";

export = new Item(script.Name)
    .setName("Tetra")
    .setDescription(
        "A teal crystal growing naturally as perfect tetrahedrons. Engineers use it to align multi-axis droplet routes.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Orpiment, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
