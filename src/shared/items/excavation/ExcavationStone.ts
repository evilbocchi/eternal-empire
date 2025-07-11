import Difficulty from "shared/Difficulty";
import Item from "shared/item/Item";

export = new Item("ExcavationStone")
.setName("Stone")
.setDescription("A basic crafting resource, found littered everywhere around the world.")
.setDifficulty(Difficulty.Excavation);
