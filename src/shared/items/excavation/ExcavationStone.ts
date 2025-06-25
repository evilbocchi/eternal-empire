import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Crystal from "shared/items/excavation/Crystal";
import Gold from "shared/items/excavation/Gold";
import Iron from "shared/items/excavation/Iron";
import Quartz from "shared/items/excavation/Quartz";
import WhiteGem from "shared/items/excavation/WhiteGem";

const ExcavationStone = new Item(script.Name)
    .setName("Stone")
    .setDescription("A basic crafting resource, found littered everywhere around the world.")
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();

ExcavationStone.trait(Shop).setItems([
    ExcavationStone,
    WhiteGem,
    Crystal,
    Iron,
    Gold,
    Quartz
]);

export = ExcavationStone;
