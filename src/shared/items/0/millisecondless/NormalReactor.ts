import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { PowerHarvester } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import CompactReactor from "shared/items/negative/reversedperipherality/CompactReactor";

export = new Upgrader("NormalReactor")
.setName("Normal Reactor")
.setDescription("Surprisingly reasonable sizing this time! Uh, wait. Each entrance gives a 3.5x Funds boost, but... oh. I wish you the best of luck in configuring this.")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Funds", 454e21), 1)
.setRequiredItemAmount(CompactReactor, 1)
.addPlaceableArea("BarrenIslands")
.setCreator("simple13579")

.setSpeed(5)
.setMul(new Price().setCost("Funds", 3.5))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
.onLoad((model) => {
    PowerHarvester.spin(model);
})