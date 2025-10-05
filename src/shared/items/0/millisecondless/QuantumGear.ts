import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Quantum Gear")
    .setDescription(
        "A mysterious gear that seems to phase in and out of reality. Probably important for elevator repairs... or time travel.",
    )
    .setDifficulty(Difficulty.Millisecondless)
    .persists();
