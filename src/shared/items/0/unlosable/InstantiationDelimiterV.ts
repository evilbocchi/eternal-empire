import Difficulty from "@rbxts/ejt";
import InstantiationDelimiter from "shared/item/traits/InstantiationDelimiter";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Instantiation Delimiter V")
    .setDescription("Increases droplet limit in Slamo Village by 15, at the cost of %drain%.")
    .setDifficulty(Difficulty.Unlosable)
    .setPrice(new CurrencyBundle().set("Skill", 100000), 1)
    .addPlaceableArea("SlamoVillage")

    .setDrain(new CurrencyBundle().set("Skill", 50))

    .trait(InstantiationDelimiter)
    .setDropletIncrease(15)

    .exit();
