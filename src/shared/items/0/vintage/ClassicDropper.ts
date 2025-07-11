import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Classic Dropper")
.setDescription("A slightly nostalgic Slamo Village dropper producing %val% droplets per second.")
.setDifficulty(Difficulty.Vintage)
.setPrice(new Price().setCost("Skill", 25), 1)
.addPlaceableArea("SlamoVillage")
.setCreator("emoronq2k")

.setDroplet(Droplet.ClassicDroplet)
.setDropRate(1);