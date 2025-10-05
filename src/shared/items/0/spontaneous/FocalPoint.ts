import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import HandCrankDropperV2 from "shared/items/0/millisecondless/HandCrankDropperV2";
import StrongCondenser from "shared/items/0/millisecondless/StrongCondenser";
import LunaryDropper from "shared/items/0/vintage/LunaryDropper";
import HydratingDropper from "shared/items/0/win/HydratingDropper";
import DropDropper from "shared/items/negative/a/DropDropper";
import DualDropper from "shared/items/negative/a/DualDropper";
import EnergyPoweredDropper from "shared/items/negative/a/EnergyPoweredDropper";
import RapidDropper from "shared/items/negative/exist/RapidDropper";
import BasicCondenser from "shared/items/negative/felixthea/BasicCondenser";
import GrassDropper from "shared/items/negative/friendliness/GrassDropper";
import HandCrankDropper from "shared/items/negative/negativity/HandCrankDropper";
import HeavyweightDropper from "shared/items/negative/negativity/HeavyweightDropper";
import VitalizedDropper from "shared/items/negative/restful/VitalizedDropper";
import OverusedAmethystDropper from "shared/items/negative/reversedperipherality/OverusedAmethystDropper";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import BulkyDropper from "shared/items/negative/tlg/BulkyDropper";
import VibrantDropper from "shared/items/negative/trueease/VibrantDropper";

export = new Item(script.Name)
    .setName("Focal Point")
    .setDescription(
        `The harnessed, harmonized energy of... a point. What point is it?
Scientists don't know. In fact, they don't even know how this item came to be.
The structure of the Focal Point is said to be the exoskeleton of what was once a powerful entity, now reduced to a mere point of energy.

Produces a %val% droplet every 4 seconds.`,
    )
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 600e42).set("Skill", 20000000).set("Dark Matter", 1e30), 1)
    .setRequiredItemAmount(TheFirstDropper, TheFirstDropper.pricePerIteration.size())
    .setRequiredItemAmount(BulkyDropper, BulkyDropper.pricePerIteration.size())
    .setRequiredItemAmount(HeavyweightDropper, HeavyweightDropper.pricePerIteration.size())
    .setRequiredItemAmount(HandCrankDropper, HandCrankDropper.pricePerIteration.size())
    .setRequiredItemAmount(GrassDropper, GrassDropper.pricePerIteration.size())
    .setRequiredItemAmount(VibrantDropper, VibrantDropper.pricePerIteration.size())
    .setRequiredItemAmount(DropDropper, DropDropper.pricePerIteration.size())
    .setRequiredItemAmount(DualDropper, DualDropper.pricePerIteration.size())
    .setRequiredItemAmount(EnergyPoweredDropper, EnergyPoweredDropper.pricePerIteration.size())
    .setRequiredItemAmount(BasicCondenser, BasicCondenser.pricePerIteration.size())
    .setRequiredItemAmount(RapidDropper, RapidDropper.pricePerIteration.size())
    .setRequiredItemAmount(OverusedAmethystDropper, OverusedAmethystDropper.pricePerIteration.size())
    .setRequiredItemAmount(VitalizedDropper, VibrantDropper.pricePerIteration.size())
    .setRequiredItemAmount(StrongCondenser, StrongCondenser.pricePerIteration.size())
    .setRequiredItemAmount(HandCrankDropperV2, HandCrankDropperV2.pricePerIteration.size())
    .setRequiredItemAmount(HydratingDropper, HydratingDropper.pricePerIteration.size())
    .setRequiredItemAmount(LunaryDropper, LunaryDropper.pricePerIteration.size())
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.TotalityDroplet)
    .setDropRate(0.25)

    .exit();
