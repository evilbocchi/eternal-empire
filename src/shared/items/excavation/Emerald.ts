import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Emerald")
    .setDescription(
        "A verdant gem saturated with natural mana. Commonly embedded in conduits to stabilize volatile energy flows.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
