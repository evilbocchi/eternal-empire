import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Gold from "shared/items/excavation/Gold";
import Grass from "shared/items/excavation/harvestable/Grass";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CraftingTable from "shared/items/negative/tfd/CraftingTable";

export = new Item(script.Name)
    .setName("Energy Powered Dropper")
    .setDescription("Produces %val% droplets per second but drains a considerable %drain%.")
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Funds", 3e12), 1)
    .setRequiredItemAmount(ExcavationStone, 15)
    .setRequiredItemAmount(WhiteGem, 5)
    .setRequiredItemAmount(Gold, 1)
    .setRequiredItemAmount(Grass, 25)
    .addPlaceableArea("BarrenIslands")
    .soldAt(CraftingTable)
    .persists()

    .trait(Dropper)
    .setDroplet(Droplet.EnergyPoweredDroplet)
    .setDropRate(1)
    .exit()

    .setDrain(new CurrencyBundle().set("Power", 20));
