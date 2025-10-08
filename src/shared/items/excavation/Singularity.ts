import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import ShellPiece from "shared/items/excavation/ShellPiece";

export = new Item(script.Name)
    .setName("Singularity")
    .setDescription(
        "A gravitational anomaly condensed into a portable shard. Warps nearby matter ever so slightly inward.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(ShellPiece, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
