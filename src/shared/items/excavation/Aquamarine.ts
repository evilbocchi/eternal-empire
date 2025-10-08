import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Volt from "shared/items/excavation/Volt";

export = new Item(script.Name)
    .setName("Aquamarine")
    .setDescription(
        "A serene cyan gem distilled from ocean currents. Its lattice resonates with water-aspected upgrades.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Volt, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
