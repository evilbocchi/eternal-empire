import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Starlight")
    .setDescription(
        "Solidified beams harvested in the upper atmosphere. Emits a gentle glow that amplifies photonic machinery.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
