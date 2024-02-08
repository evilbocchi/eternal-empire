import Charger from "shared/item/Charger";
import Conveyor from "shared/item/Conveyor";
import Dropper from "shared/item/Dropper";
import Furnace from "shared/item/Furnace";
import Generator from "shared/item/Generator";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import Shop from "shared/item/Shop";
import Transformer from "shared/item/Transformer";
import Upgrader from "shared/item/Upgrader";

interface ItemTypes {
    Dropper: Dropper;
    Furnace: Furnace;
    Shop: Shop;
    Conveyor: Conveyor;
    Upgrader: Upgrader;
    Transformer: Transformer;
    Generator: Generator;
    Charger: Charger;
    InstantiationDelimiter: InstantiationDelimiter
}

export = ItemTypes;