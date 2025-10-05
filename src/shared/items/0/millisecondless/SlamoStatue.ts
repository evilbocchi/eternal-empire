import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Slamo Statue")
    .setDescription("A beautiful representation of the Slamo species!")
    .setDifficulty(Difficulty.Millisecondless)
    .setBounds("LudicrousEscapeRing")
    .persists();
