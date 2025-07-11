import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import { OnoeNum } from "@antivivi/serikanum";
import Formula from "shared/utils/Formula";

const mul = new Price().setCost("Bitcoin", 0);

export = new Upgrader("CoinRefiner")
.setName("Coin Refiner")
.setDescription("Boosts Bitcoin gain, with that multiplier increasing by Bitcoin.")
.setDifficulty(Difficulty.DoNothing)
.setPrice(new Price().setCost("Funds", 70e24).setCost("Bitcoin", 360), 1)
.setPrice(new Price().setCost("Funds", 620e24).setCost("Bitcoin", 1200), 2)
.addPlaceableArea("BarrenIslands")
.setCreator("CoPKaDT")

.setFormula(new Formula().add(1).log(32).pow(1.1).div(3).add(1))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Bitcoin", v)), 
    () => new OnoeNum(utils.getBalance().getCost("Bitcoin") ?? 0)));