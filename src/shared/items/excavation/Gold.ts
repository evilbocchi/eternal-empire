import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Gold")
    .setDescription(
        "A precious metal mostly used to flaunt wealth. Has many uses in science, but very expensive to harvest and produce.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
