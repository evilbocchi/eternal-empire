import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Price from "shared/Price";

export = new Dropper(script.Name)
.setName("Purifiers' Dream")
.setDescription("An unfounded treasure meant solely for the mastery of purification, producing %val% droplets every 2 seconds.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", 9.9e21).setCost("Purifier Clicks", 8000), 1)
.addPlaceableArea("BarrenIslands")

.setDroplet(Droplet.PurifiersDroplet)
.setDropRate(0.5);