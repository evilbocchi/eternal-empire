import Difficulty from "@antivivi/jjt-difficulties";
import Shop from "shared/item/Shop";
import Class0Shop from "../Class0Shop";
import Glass from "./Glass";
import Stone from "./Stone";
import Wood from "./Wood";

export = new Shop(script.Name)
.setName("Slamo Store")
.setDifficulty(Difficulty.Millisecondless)
.setItems([
    Class0Shop,
    Wood,
    Stone,
    Glass
]);