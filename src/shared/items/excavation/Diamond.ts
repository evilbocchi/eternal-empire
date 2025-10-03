import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Diamond")
    .setDescription(
        "Harder than any alloy known to mortals; its faultless facets make it perfect for high-pressure condensers and reactors.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
