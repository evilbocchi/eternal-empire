import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Silent Memory")
    .setDescription("The price you pay for a basic furnace placeable in Sky Pavilion.")
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Funds", 3e45), 1)
    .addPlaceableArea("SkyPavilion")
    .setCreator("CoPKaDT")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 1))

    .exit();