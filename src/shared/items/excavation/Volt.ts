import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Volt")
    .setDescription(
        "Crackling yellow ore packed with static charge. A single fragment can jump-start dormant machinery.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
