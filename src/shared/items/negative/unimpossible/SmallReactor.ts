import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";

export = new Upgrader("SmallReactor")
.setName("Small Reactor")
.setDescription("Small? THAT is small? Well, this 'small' reactor gives a $3.5x boost to any droplets passing through it.")
.setDifficulty(Difficulty.Unimpossible)
.setPrice(new Price().setCost("Funds", 3500000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5)
.setMul(new Price().setCost("Funds", 3.5))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));