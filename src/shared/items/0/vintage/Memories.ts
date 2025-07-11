import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader(script.Name)
.setName("memories...")
.setDescription("Feels so oddly familiar to you, it gives you the shivers. .. ...restores 25 HP to droplets.")
.setDifficulty(Difficulty.Vintage)
.setPrice(new Price().setCost("Funds", 400e27), 1)
.setPrice(new Price().setCost("Funds", 4e30), 2)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.setCreator("CoPKaDT")

.setSpeed(2)
.setDamage(-25);