import Difficulty from "@antivivi/jjt-difficulties";
import Shop from "shared/item/Shop";
import Crystal from "shared/items/excavation/Crystal";
import Gold from "shared/items/excavation/Gold";
import Iron from "shared/items/excavation/Iron";
import Quartz from "shared/items/excavation/Quartz";
import WhiteGem from "shared/items/excavation/WhiteGem";

const ExcavationStone = new Shop(script.Name)
.setName("Stone")
.setDescription("A basic crafting resource, found littered everywhere around the world.")
.setDifficulty(Difficulty.Excavation);

ExcavationStone.setItems([
    ExcavationStone,
    WhiteGem,
    Crystal,
    Iron,
    Gold,
    Quartz
]);

export = ExcavationStone;
