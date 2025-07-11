import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Special from "shared/item/Special";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Dropper("HandCrankDropperV2")
.setName("Hand Crank Dropper V2")
.setDescription("We loove hand cranking. Increases drop rate to 3x when cranked, producing $60K/droplet/s in its normal state. This item will reset on skillification, like other Barren Islands items!")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Funds", new InfiniteMath([121, 21])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([242, 21])), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.setDroplet(Droplet.ManualV2Droplet)
.setDropRate(1)
.onLoad((model) => {
    const drop = model.WaitForChild("Drop");
    Special.HandCrank.load(model, (t) => drop.SetAttribute("DropRate", t < 5 ? 3 : 1));
});