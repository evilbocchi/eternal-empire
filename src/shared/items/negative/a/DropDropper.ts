import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import FurnaceDropper from "shared/item/FurnaceDropper";
import Price from "shared/Price";

export = new FurnaceDropper("DropDropper")
.setName("Recycling Dropper")
.setDescription("Produces a $4K, 3 W droplet every time a droplet is processed through the attached furnace. No need for conjoined droppers anymore.")
.setDifficulty(Difficulty.A)
.setPrice(new Price().setCost("Funds", 6.5e12), 1)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.CommunismDroplet)
.onProcessed((model, _utils, item) => {
    const instantiator = item?.instantiatorPerDrop.get(model.WaitForChild("Drop") as BasePart);
    if (instantiator !== undefined) {
        instantiator();
    }
});