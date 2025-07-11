import Difficulty from "shared/Difficulty";
import Shop from "shared/item/Shop";
import DropletDiverger from "shared/items/miscellaneous/DropletDiverger";
import ElectroshockedCoil from "shared/items/miscellaneous/ElectroshockedCoil";
import IndustrialOverpass from "shared/items/miscellaneous/IndustrialOverpass";
import Lamp from "shared/items/miscellaneous/Lamp";
import LimitBreaker from "shared/items/miscellaneous/LimitBreaker";
import OverengineeredGenerator from "shared/items/miscellaneous/OverengineeredGenerator";
import TeslaCharger from "shared/items/miscellaneous/TeslaCharger";

export = new Shop("CraftingTable")
.setName("Crafting Table")
.setDifficulty(Difficulty.Bonuses)
.setItems([
    Lamp,
    OverengineeredGenerator,
    IndustrialOverpass,
    LimitBreaker,
    ElectroshockedCoil,
    DropletDiverger,
    TeslaCharger
]);