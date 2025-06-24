import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import Crystal from "shared/items/excavation/Crystal";

export = new Item(script.Name)
    .setName("Frost Snow")
    .setDescription("A perfect blue pit. %mul% droplet value.")
    .setDifficulty(Difficulty.JustAir)
    .setPrice(new CurrencyBundle().set("Funds", 1e30), 1)
    .setRequiredItemAmount(Crystal, 35)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("CoPKaDT")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Bitcoin", 5))

    .exit();