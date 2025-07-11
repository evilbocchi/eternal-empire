import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Factory from "shared/item/Factory";

export = new Factory("RustyFactory")
.setName("Rusty Factory")
.setDescription("A Factory that has gone through the various stages of wear and tear. Produces $180 droplets per seocnd.")
.setDifficulty(Difficulty.Miscellaneous)
.setCreator("CoPKaDT")

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.RustyDroplet)
.setDropRate(1)
.setSpeed(4)