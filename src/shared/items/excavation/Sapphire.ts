import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Sapphire")
    .setDescription(
        "A deep blue crystal that refracts light into steady pulses. Essential in optics for high-precision droplet scanners.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
