import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Special from "shared/item/Special";

export = new Dropper("HandCrankDropper")
.setName("Hand Crank Dropper")
.setDescription("Manual labour at its finest! Click the hand crank to increase drop rate to 3x. Produces $15/droplet/s in its normal state.")
.setDifficulty(Difficulty.Negativity)
.setPrice(new Price().setCost("Funds", 5500), 1, 2)
.setPrice(new Price().setCost("Funds", 7000), 3)
.addPlaceableArea(AREAS.BarrenIslands)

.setDroplet(Droplet.ManualDroplet)
.setDropRate(1)
.onLoad((model) => {
    const drop = model.WaitForChild("Drop");
    Special.HandCrank.load(model, (t) => drop.SetAttribute("DropRate", t < 5 ? 3 : 1));
});