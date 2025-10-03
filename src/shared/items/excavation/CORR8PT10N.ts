import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("CORR8PT10N")
    .setDescription(
        "A glitching neon crystal that flickers between realities. Engineers swear it distorts probability itself.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
