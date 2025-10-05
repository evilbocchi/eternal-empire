import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Singularity")
    .setDescription(
        "A gravitational anomaly condensed into a portable shard. Warps nearby matter ever so slightly inward.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
