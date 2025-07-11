import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Furnace from "shared/item/Furnace";


export = new Furnace(script.Name)
.setName("Purifying Cauldron")
.setDescription("A massive %mul% boost. Though, this also costs a pretty massive price.")
.setDifficulty(Difficulty.Winsome)
.setPrice(new Price().setCost("Dark Matter", 36000), 1)
.addPlaceableArea("BarrenIslands")
.persists("Skillification")

.setMul(new Price().setCost("Purifier Clicks", 26));