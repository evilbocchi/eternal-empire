import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import Crystal from "shared/items/excavation/Crystal";
import Price from "shared/Price";

export = new Furnace(script.Name)
.setName("Frost Snow")
.setDescription("Exuding an icy aura, this item is capable of turning anything into a glacial masterpiece. %mul% droplet value.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Funds", 1e30), 1)
.setRequiredItemAmount(Crystal, 40)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.setCreator("CoPKaDT")

.setMul(new Price().setCost("Bitcoin", 5));