import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Item from "shared/item/Item";

export = new Item(script.Name)
.setName("Basic Blank Essence")
.setDescription("A small piece of the Void, ready to manifest into whatever you choose.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", 30e21).setCost("Power", 20e12).setCost("Purifier Clicks", 150000), 1)
.addPlaceableArea("BarrenIslands")

.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));