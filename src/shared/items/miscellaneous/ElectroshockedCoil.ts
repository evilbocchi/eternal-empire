import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Crystal from "shared/items/excavation/Crystal";
import WhiteGem from "shared/items/excavation/WhiteGem";
import { GameUtils } from "shared/utils/ItemUtils";

const first = new Price().setCost("Power", 3);
const second = new Price().setCost("Power", 50);
const third = new Price().setCost("Power", 1000);
let mode = 0;

export = new Upgrader(script.Name)
    .setName("Electroshocked Coil")
    .setDescription("Has increasing effects as Power milestones are reached: +3 W by default, +50 W at 1M W and +1000 W at 1T W.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new Price().setCost("Funds", 1e9))
    .setRequiredItemAmount(WhiteGem, 35)
    .setRequiredItemAmount(Crystal, 1)
    .addPlaceableArea("BarrenIslands").setCreator("Trabitic")

    .setSpeed(3)
    .onInit((item) => {
        GameUtils.currencyService.balanceChanged.connect((balance) => {
            const power = balance.get("Power");
            if (power === undefined || power.lessThan(1000000)) {
                item.setAdd(first);
                mode = 1;
            }
            else if (power.lessThan(1e+12)) {
                item.setAdd(second);
                mode = 2;
            }
            else {
                item.setAdd(third);
                mode = 3;
            }
        });
    })
    .onLoad((model, item) => {
        const rings = [model.WaitForChild(1), model.WaitForChild(2), model.WaitForChild(3)] as BasePart[];
        item.repeat(model, () => {
            for (let i = 0; i < 3; i++) {
                const ring = rings[i];
                ring.Transparency = mode > i ? 0 : 0.7;
            }
        });
    });