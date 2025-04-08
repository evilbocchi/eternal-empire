import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Frost Snow")
    .setDescription("Exuding an icy aura, this item is capable of turning anything into a glacial masterpiece. %mul% droplet value.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new CurrencyBundle().set("Funds", 1e30), 1)
    .setRequiredItemAmount(Crystal, 40)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("CoPKaDT")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Bitcoin", 5))

    .exit();