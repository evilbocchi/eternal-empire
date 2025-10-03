import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Aquamarine")
    .setDescription(
        "A serene cyan gem distilled from ocean currents. Its lattice resonates with water-aspected upgrades.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
