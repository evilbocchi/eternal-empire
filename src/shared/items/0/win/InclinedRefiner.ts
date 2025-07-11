import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";

export = new Upgrader(script.Name)
.setName("Inclined Refiner")
.setDescription("Inclines up then down... %add% to droplets in Slamo Village.")
.setDifficulty(Difficulty.Win)
.setPrice(new Price().setCost("Funds", 4.1e24).setCost("Skill", 1), 1)
.setCreator("MHPlayer12")
.addPlaceableArea("SlamoVillage")

.setSpeed(5)
.setAdd(new Price().setCost("Funds", 1000));