import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Crystal from "shared/items/excavation/Crystal";
import Iron from "shared/items/excavation/Iron";

export = new Upgrader(script.Name)
.setName("Overhead Upgrader")
.setDescription("Why would you craft something so weirdly shaped? Who knows. %mul% value to droplets.")
.setDifficulty(Difficulty.Win)
.setPrice(new Price().setCost("Skill", 6), 1)
.setPrice(new Price().setCost("Skill", 270), 2)
.setRequiredItemAmount(Crystal, 15)
.setRequiredItemAmount(Iron, 3)
.setCreator("filipthesuperstar")
.addPlaceableArea("SlamoVillage")

.setSpeed(5)
.setMul(new Price().setCost("Skill", 2));