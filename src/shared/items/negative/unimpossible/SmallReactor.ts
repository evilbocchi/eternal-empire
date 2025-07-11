import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader("SmallReactor")
.setName("Small Reactor")
.setDescription("This 'small' reactor gives a %mul%x boost to any droplets passing through it.")
.setDifficulty(Difficulty.Unimpossible)
.setPrice(new Price().setCost("Funds", 3500000), 1)
.addPlaceableArea("BarrenIslands")

.setSpeed(5)
.setMul(new Price().setCost("Funds", 3.5))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));