import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Nissonite")
    .setDescription(
        "A midnight blue shard, said to form where lightning strikes ancient seabeds. It hums softly beneath ultraviolet light.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
