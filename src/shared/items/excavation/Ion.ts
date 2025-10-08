import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Starlight from "shared/items/excavation/Starlight";

export = new Item(script.Name)
    .setName("Ion")
    .setDescription(
        "Hyper-charged mineral fragments buzzing with unstable particles. Handle with insulated gloves—or a robot arm.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Starlight, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
