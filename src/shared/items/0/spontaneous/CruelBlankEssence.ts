import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

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
            .set("Funds", 1e48)
            .set("Power", 1e33)
            .set("Bitcoin", 1e15)
            .set("Skill", 1e9)
            .set("Purifier Clicks", 1e33)
            .set("Dark Matter", 1e33),
        1,
    )
    .addPlaceableArea("BarrenIslands", "SlamoVillage");
