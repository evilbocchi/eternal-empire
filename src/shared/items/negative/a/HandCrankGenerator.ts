import Difficulty from "shared/Difficulty";
import Generator from "shared/item/Generator";
import Special from "shared/item/Special";
import Price from "shared/Price";

export = new Generator("HandCrankGenerator")
.setName("Hand Crank Generator")
.setDescription("Did you enjoy the Hand Crank Dropper? If so, you'll love the all-new Hand Crank Generator! Produces 26 W/s and $1B/s, tripling its stats when cranked.")
.setDifficulty(Difficulty.A)
.setPrice(new Price().setCost("Power", 104000), 1)
.setPrice(new Price().setCost("Power", 648100), 2)
.addPlaceableArea("BarrenIslands")

.setPassiveGain(new Price().setCost("Power", 26).setCost("Funds", 1e9))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
.onLoad((model) => {
    Special.HandCrank.load(model, (t) => model.SetAttribute("GeneratorBoost", t < 10 ? 3 : 1));
});