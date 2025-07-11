import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Rusty Factory")
.setDescription("A Factory that has gone through the various stages of wear and tear. Produces $180 droplets per second.")
.setDifficulty(Difficulty.Miscellaneous)
.setCreator("CoPKaDT")

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.RustyDroplet)
.setDropRate(1)
.setSpeed(4)