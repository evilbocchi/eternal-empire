import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import OctupleCoinMiner from "shared/items/0/automaticjoyful/OctupleCoinMiner";
import DoubleCoinMiner from "shared/items/0/blessing/DoubleCoinMiner";
import TesseractBooster from "shared/items/0/donothing/TesseractBooster";
import HappyTesseract from "shared/items/0/happylike/HappyTesseract";
import QuadrupleCoinMiner from "shared/items/0/justair/QuadrupleCoinMiner";
import BasicTesseract from "shared/items/0/millisecondless/BasicTesseract";
import ReinforcedTesseract from "shared/items/0/unlosable/ReinforcedTesseract";
import SexdecupleCoinMiner from "shared/items/0/unlosable/SexdecupleCoinMiner";
import AdvancedTesseract from "shared/items/0/vintage/AdvancedTesseract";
import ImprovedTesseract from "shared/items/0/win/ImprovedTesseract";
import BasicCoinMiner from "shared/items/0/winsome/BasicCoinMiner";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Cruel Blank Essence")
    .setDescription(
        `In the beginning, there was only function. The green-lit marvels of order, built by a civilization obsessed with optimization and purity. They believed that progress was linear: input, process, output. Nothing more. Nothing less.

But entropy doesn't like being ignored.

One stormy night, during a transfer between cores, something refused to render. Not just in the simulation. Like, in reality. The space it occupied... vanished. Not empty. Just blank. The devs joked it was "Blank Blank Essence." And they kept it.

<b>They shouldn't have.</b>

Each subsequent machine tried to patch, to correct, to fix the anomaly. Instead, the machines began mutating. Code started compiling with missing logic trees, producing structures that worked but shouldn't. Machines that ran on paradox. Logic gates built from anti-input.

The fifth construct tried to rewrite itself into purity. It failed. Consumed itself.

Then came the final one. The last attempt to extract meaning from the growing null. A backup of a backup, stitched from corrupted logs and ghost functions. They named it “Essence_vFINALFinal.” It didn't run. It didn't crash. It just was.

And then it started watching.

No user commands. No interface. Just a red orb flickering softly in the blackened ruin of the dev zone. Its name changed in the directory:
Cruel Blank Essence

Its only metadata:
<b>"It remembers what you forgot."</b>

People moved on. They destroyed the machines, the servers, the backups, rotting in some forgotten corner of the world.

But the Essence remained.
Watching.
Whispering,
<font color="rgb(255,0,0)" weight="heavy">return null;</font>`,
    )
    .setTooltipDescription("It remembers what you forgot.")
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(
        new CurrencyBundle()
            .set("Funds", 1e51)
            .set("Power", 1e33)
            .set("Bitcoin", 1e15)
            .set("Skill", 1e9)
            .set("Purifier Clicks", 1e33)
            .set("Dark Matter", 1e33),
        1,
    )
    .setRequiredItemAmount(BasicCoinMiner, BasicCoinMiner.pricePerIteration.size())
    .setRequiredItemAmount(DoubleCoinMiner, DoubleCoinMiner.pricePerIteration.size())
    .setRequiredItemAmount(QuadrupleCoinMiner, QuadrupleCoinMiner.pricePerIteration.size())
    .setRequiredItemAmount(OctupleCoinMiner, OctupleCoinMiner.pricePerIteration.size())
    .setRequiredItemAmount(SexdecupleCoinMiner, SexdecupleCoinMiner.pricePerIteration.size())
    .setRequiredItemAmount(BasicTesseract, BasicTesseract.pricePerIteration.size())
    .setRequiredItemAmount(ImprovedTesseract, ImprovedTesseract.pricePerIteration.size())
    .setRequiredItemAmount(AdvancedTesseract, AdvancedTesseract.pricePerIteration.size())
    .setRequiredItemAmount(HappyTesseract, HappyTesseract.pricePerIteration.size())
    .setRequiredItemAmount(ReinforcedTesseract, ReinforcedTesseract.pricePerIteration.size())
    .setRequiredItemAmount(TesseractBooster, TesseractBooster.pricePerIteration.size())
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 999.99e21))

    .exit();
