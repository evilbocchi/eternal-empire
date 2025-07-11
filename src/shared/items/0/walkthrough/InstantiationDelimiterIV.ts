import Difficulty from "@antivivi/jjt-difficulties";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import InstantiationDelimiterIII from "shared/items/negative/skip/InstantiationDelimiterIII";
import Price from "shared/Price";

export = new InstantiationDelimiter(script.Name)
.setName("Instantiation Delimiter IV")
.setDescription("The final Barren Islands delimiter. Increases droplet limit by 100. Does not drain.")
.setDifficulty(Difficulty.Walkthrough)
.setPrice(new Price().setCost("Power", 800e18).setCost("Skill", 1500), 1)
.setRequiredItemAmount(InstantiationDelimiterIII, 1)
.addPlaceableArea("BarrenIslands")

.setDropletIncrease(100);