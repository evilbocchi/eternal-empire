import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("'Happy' Dropper")
.setDescription("Happy, fun times! Yay! Produces %val% droplets per second!! Yes, Skill! What a great boost! You'll agree, right? RIGHT?")
.setDifficulty(Difficulty.Happylike)
.setPrice(new Price().setCost("Funds", 600e30).setCost("Power", 1e18).setCost("Skill", 20), 1)
.setPrice(new Price().setCost("Funds", 1.2e33).setCost("Power", 2e18).setCost("Skill", 40), 2)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setDroplet(Droplet.HappyDroplet)
.setDropRate(1);