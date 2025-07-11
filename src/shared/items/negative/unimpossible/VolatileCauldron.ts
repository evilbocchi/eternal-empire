import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";

export = new Furnace(script.Name)
.setName("Volatile Cauldron")
.setDescription("A cauldron giving... some multiplier of Funds? I don't know.")
.setDifficulty(Difficulty.Unimpossible)
.setPrice(new Price().setCost("Funds", 700000), 1)
.addPlaceableArea("BarrenIslands")
.acceptsUpgrades(false)

.setMul(new Price().setCost("Funds", 225))
.setVariance(0.4);