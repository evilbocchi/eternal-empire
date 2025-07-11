import Charger from "shared/item/Charger";
import Condenser from "shared/item/Condenser";
import Conveyor from "shared/item/Conveyor";
import Dropper from "shared/item/Dropper";
import Furnace from "shared/item/Furnace";
import FurnaceDropper from "shared/item/FurnaceDropper";
import Generator from "shared/item/Generator";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import Shop from "shared/item/Shop";
import { Killbrick, Manumatic } from "shared/item/Special";
import Transformer from "shared/item/Transformer";
import UpgradeBoard from "shared/item/UpgradeBoard";
import Upgrader from "shared/item/Upgrader";
import Printer from "./Printer";

interface ItemTypes {
    Dropper: Dropper;
    Furnace: Furnace;
    Shop: Shop;
    Conveyor: Conveyor;
    Upgrader: Upgrader;
    Transformer: Transformer;
    Generator: Generator;
    Charger: Charger;
    InstantiationDelimiter: InstantiationDelimiter;
    UpgradeBoard: UpgradeBoard;
    FurnaceDropper: FurnaceDropper;
    Condenser: Condenser;
    Clickable: Manumatic.Clickable;
    Clicker: Manumatic.Clicker;
    Damager: Killbrick.Damager;
    Printer: Printer;
}

export = ItemTypes;