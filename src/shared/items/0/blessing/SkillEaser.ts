import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Skill Easer")
.setDescription("%add% value to droplets. You need to ease up a little. Everything will get faster...")
.setDifficulty(Difficulty.Blessing)
.setPrice(new Price().setCost("Skill", 16), 1)
.setCreator("goog_als")
.addPlaceableArea("SlamoVillage")

.setSpeed(5)
.setAdd(new Price().setCost("Skill", 0.02));