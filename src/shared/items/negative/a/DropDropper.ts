import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Droplet from "shared/item/Droplet";
import FurnaceDropper from "shared/item/FurnaceDropper";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new FurnaceDropper("DropDropper")
.setName("Recycling Dropper")
.setDescription("Produces a $4K, 3 W droplet every time a droplet is processed through the attached furnace. No need for conjoined droppers anymore.")
.setDifficulty(Difficulties.A)
.setPrice(new Price().setCost("Funds", new InfiniteMath([6.5, 12])), 1)

.addPlaceableArea(AREAS.BarrenIslands)
.setDroplet(Droplet.CommunismDroplet)
.onProcessed((model, _utils, item) => {
    const instantiator = item?.instantiatorPerDrop.get(model.WaitForChild("Drop") as BasePart);
    if (instantiator !== undefined) {
        instantiator();
    }
});