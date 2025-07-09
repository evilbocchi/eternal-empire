import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Dropper from "shared/item/traits/dropper/Dropper";

export = new Item(script.Name)
    .setName("Rusty Factory")
    .setDescription(`A Factory that has gone through the various stages of wear and tear.
Produces %val% droplets per second.`
    )
    .setDifficulty(Difficulty.Negativity)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands")
    .persists()

    .trait(Dropper)
    .setDroplet(Droplet.RustyDroplet)
    .setDropRate(1)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();