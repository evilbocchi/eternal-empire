import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Quartz")
    .setDescription(
        "No one knows why such a common mineral in the ancient days is so hard to come by nowadays. It's as if someone harvested all of it and kept it hidden beneath everyone's eyes.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
