import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Ion")
    .setDescription(
        "Hyper-charged mineral fragments buzzing with unstable particles. Handle with insulated gloves—or a robot arm.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
