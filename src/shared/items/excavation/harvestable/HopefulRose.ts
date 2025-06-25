import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Grass from "shared/items/excavation/harvestable/Grass";

export = new Item(script.Name)
    .setName("Hopeful Rose")
    .setDescription("You waste your whole life, and for what purpose? This is your purpose. %mul%. Unstackable. But %mul%. Hope is here.")
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Funds", 99))
    .setRequiredItemAmount(Grass, 100000)
    .addPlaceableArea("BarrenIslands")
    .setLevelReq(6)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.1))
    .stacks(false)

    .exit();
