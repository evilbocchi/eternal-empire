import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Tetra")
    .setDescription(
        "A teal crystal growing naturally as perfect tetrahedrons. Engineers use it to align multi-axis droplet routes.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
