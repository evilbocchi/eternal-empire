import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";

export = new Item(script.Name)
    .setName("Heavy-weight Dropper")
    .setDescription(`This dropper has a comparably large build compared to its peers.
Produces %val% droplets every 2 seconds.`
    )
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 9000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 14000), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.HeavyweightDroplet)
    .setDropRate(0.5)

    .exit();