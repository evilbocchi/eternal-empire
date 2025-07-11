import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";

export = new Furnace(script.Name)
.setName("Basic Cauldron")
.setDescription("Able to process droplets for %mul% more Funds, but must be directly dropped into.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 5000), 1)
.addPlaceableArea("BarrenIslands")
.acceptsUpgrades(false)

.setMul(new Price().setCost("Funds", 25));