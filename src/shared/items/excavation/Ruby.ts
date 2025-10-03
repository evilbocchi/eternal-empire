import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Ruby")
    .setDescription(
        "A radiant crimson gemstone whose crystalline lattice resonates perfectly with high-heat furnaces and laser arrays.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
