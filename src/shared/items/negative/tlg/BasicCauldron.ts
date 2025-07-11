import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";

export = new Furnace("BasicCauldron")
.setName("Basic Cauldron")
.setDescription("Able to process droplets for %mul%x more Funds, but must be directly dropped into.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 5000), 1)
.addPlaceableArea("BarrenIslands")
.acceptsUpgrades(false)

.setMul(new Price().setCost("Funds", 25));