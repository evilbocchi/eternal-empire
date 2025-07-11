import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper("SpatialDropper")
.setName("Spatial Dropper")
.setDescription("A dropper placeable in Slamo Village producing %val% droplets per second, saving between skillifications!")
.setDifficulty(Difficulty.Astronomical)
.setPrice(new Price().setCost("Skill", 2), 1)
.setPrice(new Price().setCost("Skill", 3), 1)
.addPlaceableArea("SlamoVillage")

.setDroplet(Droplet.SpatialDroplet)
.setDropRate(1);