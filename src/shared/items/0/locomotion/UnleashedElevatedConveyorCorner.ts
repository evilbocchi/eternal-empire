import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Unleashed Elevated Conveyor Corner")
.setDescription("Don't you love conveyor corners? Keep your droplets elevated while turning them with ease.")
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Skill", 6), 1, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(9);