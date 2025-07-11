import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Item from "shared/item/Item";

export = new Item(script.Name)
.setName("Advanced Blank Essence")
.setDescription("Didn't expect another one of these to pop up so soon, did you? Each purchase of this item will raise the price of the next by 1000x Funds and 100x Power.")
.setDifficulty(Difficulty.Ifinitude)
.setPrice(new Price().setCost("Funds", 1e30).setCost("Power", 100e15), 1)
.setPrice(new Price().setCost("Funds", 1e33).setCost("Power", 10e18), 2)
.setPrice(new Price().setCost("Funds", 1e36).setCost("Power", 1e21), 3)
.setPrice(new Price().setCost("Funds", 1e39).setCost("Power", 100e21), 4)
.setPrice(new Price().setCost("Funds", 1e42).setCost("Power", 10e24), 5)
.addPlaceableArea("BarrenIslands")

.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));