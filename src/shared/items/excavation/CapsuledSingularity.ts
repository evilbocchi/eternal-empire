import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Singularity from "shared/items/excavation/Singularity";

export = new Item(script.Name)
    .setName("Capsuled Singularity")
    .setDescription(
        "A Singularity safely locked within an alloy capsule. Emits a faint haze that bends reality yet remains stable.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Singularity, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
