import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import FormulaBundled from "shared/item/traits/FormulaBundled";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import EffervescentDropletSpray from "shared/items/negative/exist/EffervescentDropletSpray";

export = new Item(script.Name)
    .setName("Industrial Droplet Spray")
    .setDescription(
        "The sequel to the Effervescent Droplet Spray, this spray provides the same boost but has a much higher cap.",
    )
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Purifier Clicks", 2500), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setCreator("shooerThe")

    .setFormula(EffervescentDropletSpray.formula!)
    .setFormulaX(EffervescentDropletSpray.formulaX!)
    .setFormulaXCap(EffervescentDropletSpray.formulaXCap!.pow(2))

    .trait(Conveyor)
    .setSpeed(5)

    .trait(FormulaBundled)
    .setRatios(EffervescentDropletSpray.trait(FormulaBundled).ratio!)
    .setX(EffervescentDropletSpray.trait(FormulaBundled).x!)
    .apply(Upgrader)

    .exit();
