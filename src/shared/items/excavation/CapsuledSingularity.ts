import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Capsuled Singularity")
    .setDescription(
        "A Singularity safely locked within an alloy capsule. Emits a faint haze that bends reality yet remains stable.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
