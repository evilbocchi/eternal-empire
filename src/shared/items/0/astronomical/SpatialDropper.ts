import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper("SpatialDropper")
.setName("Spatial Dropper")
.setDescription("A dropper placeable in Slamo Village producing $1K/droplet/s, saving between skillifications!")
.setDifficulty(Difficulty.Astronomical)
.setPrice(new Price().setCost("Skill", 2), 1)
.addPlaceableArea(AREAS.SlamoVillage)

.setDroplet(Droplet.SpatialDroplet)
.setDropRate(1);