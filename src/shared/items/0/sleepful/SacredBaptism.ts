import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Gold from "shared/items/excavation/Gold";
import Iron from "shared/items/excavation/Iron";

export = new Upgrader(script.Name)
.setName("Sacred Baptism")
.setDescription("That's right. You need to baptise your droplets to make them stronger. %mul% droplet value.")
.setDifficulty(Difficulty.Sleepful)
.setPrice(new Price().setCost("Funds", 3e27).setCost("Skill", 10), 1)
.setRequiredItemAmount(Iron, 10)
.setRequiredItemAmount(Gold, 1)
.addPlaceableArea("SlamoVillage")
.setCreator("CoPKaDT")

.setSpeed(4)
.setMul(new Price().setCost("Funds", 25));