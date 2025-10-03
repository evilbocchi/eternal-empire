import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Boracite")
    .setDescription(
        "A rare turquoise crystal with ferroelectric properties, perfect for synchronizing multi-phase droplet networks.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
