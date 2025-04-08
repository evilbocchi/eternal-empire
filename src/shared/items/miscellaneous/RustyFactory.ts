import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Rusty Factory")
    .setDescription("A Factory that has gone through the various stages of wear and tear. Produces $180 droplets per second.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.RustyDroplet)
    .setDropRate(1)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();