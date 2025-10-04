import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Sky Crystal")
    .setDescription("A glowing crystal that hums with sky energy. It's literally too cool for ground level.")
    .setDifficulty(Difficulty.Millisecondless)
    .persists();
