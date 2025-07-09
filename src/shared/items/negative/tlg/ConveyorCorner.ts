import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";

export = new Item(script.Name)
    .setName("Conveyor Corner")
    .setDescription(`A conveyor invented by Move-Your-Droplets™. Advertised to 'rotate any droplet, any time.'
Only goes clockwise, unfortunately.`
    )
    .setDifficulty(Difficulty.TheLowerGap)
    .setPrice(new CurrencyBundle().set("Funds", 90), 1, 5)
    .addPlaceableArea("BarrenIslands")

    .trait(Conveyor)
    .setSpeed(5)
    .exit();