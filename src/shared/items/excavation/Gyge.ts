import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Gyge")
    .setDescription(
        "A deep magenta mineral that absorbs ambient sound. Often etched into silencers for volatile droplet rigs.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
