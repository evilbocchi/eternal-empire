import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Lollipop")
    .setDescription(
        "A sugary crystalline deposit formed in abandoned candy caverns. Surprisingly durable despite its flavor.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
