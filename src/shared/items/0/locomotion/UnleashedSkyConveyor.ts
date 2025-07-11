import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Unleashed Sky Conveyor")
.setDescription("And now, a conveyor to convey your super-elevated droplets.")
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Skill", 12), 1, 15)
.setPrice(new Price().setCost("Skill", 24), 16, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")
.setSky(true)
.setSpeed(9);