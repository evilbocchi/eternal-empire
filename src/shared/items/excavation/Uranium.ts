import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Uranium")
    .setDescription(
        "A dense, radioactive ore that hums with latent power. Integral to reactor cores and questionable science projects.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
