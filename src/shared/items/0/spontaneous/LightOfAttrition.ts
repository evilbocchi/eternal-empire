import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import AutomaticJoyfulFurnace from "shared/items/0/automaticjoyful/AutomaticJoyfulFurnace";
import RoboticCauldron from "shared/items/0/walkthrough/RoboticCauldron";
import PurifyingCauldron from "shared/items/0/winsome/PurifyingCauldron";
import ColorStrictFurnace from "shared/items/negative/exist/ColorStrictFurnace";
import EnergisedFurnace from "shared/items/negative/friendliness/EnergisedFurnace";
import IndustrialFurnace from "shared/items/negative/friendliness/IndustrialFurnace";
import MoltenAltar from "shared/items/negative/instantwin/MoltenAltar";
import AdvancedPowerHarvester from "shared/items/negative/relax/AdvancedPowerHarvester";
import TheFirstFurnace from "shared/items/negative/tfd/TheFirstFurnace";
import BasicCauldron from "shared/items/negative/tlg/BasicCauldron";
import ImprovedFurnace from "shared/items/negative/tlg/ImprovedFurnace";
import BasicPowerHarvester from "shared/items/negative/trueease/BasicPowerHarvester";
import ButtonFurnace from "shared/items/negative/unimpossible/ButtonFurnace";
import VolatileCauldron from "shared/items/negative/unimpossible/VolatileCauldron";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Light of Attrition")
    .setDescription(
        `A self-sustaining light that only concerns itself with sucking the life out of anything it touches.

Processes droplets at %mul% value.`,
    )
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 100e42).set("Bitcoin", 1e12), 1)
    .setRequiredItemAmount(TheFirstFurnace, TheFirstFurnace.pricePerIteration.size())
    .setRequiredItemAmount(ImprovedFurnace, ImprovedFurnace.pricePerIteration.size())
    .setRequiredItemAmount(BasicCauldron, BasicCauldron.pricePerIteration.size())
    .setRequiredItemAmount(VolatileCauldron, VolatileCauldron.pricePerIteration.size())
    .setRequiredItemAmount(ButtonFurnace, ButtonFurnace.pricePerIteration.size())
    .setRequiredItemAmount(IndustrialFurnace, IndustrialFurnace.pricePerIteration.size())
    .setRequiredItemAmount(EnergisedFurnace, EnergisedFurnace.pricePerIteration.size())
    .setRequiredItemAmount(BasicPowerHarvester, BasicPowerHarvester.pricePerIteration.size())
    .setRequiredItemAmount(ColorStrictFurnace, ColorStrictFurnace.pricePerIteration.size())
    .setRequiredItemAmount(AdvancedPowerHarvester, AdvancedPowerHarvester.pricePerIteration.size())
    .setRequiredItemAmount(MoltenAltar, MoltenAltar.pricePerIteration.size())
    .setRequiredItemAmount(PurifyingCauldron, PurifyingCauldron.pricePerIteration.size())
    .setRequiredItemAmount(RoboticCauldron, RoboticCauldron.pricePerIteration.size())
    .setRequiredItemAmount(AutomaticJoyfulFurnace, AutomaticJoyfulFurnace.pricePerIteration.size())
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)
    .setCreator("sanjay2133")

    .trait(Furnace)
    .acceptsUpgrades(false)
    .setMul(new CurrencyBundle().set("Funds", 1e9).set("Power", 1e6).set("Skill", 1e3).set("Purifier Clicks", 1e6))

    .exit();
