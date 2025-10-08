import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";

export = new Item(script.Name)
    .setName("Capsuled Singularity")
    .setDescription(
        "A Singularity safely locked within an alloy capsule. Emits a faint haze that bends reality yet remains stable.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
