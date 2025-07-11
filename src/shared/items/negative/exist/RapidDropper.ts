import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Dropper("RapidDropper")
.setName("Rapid Dropper")
.setDescription("Pew pew pew... or something. Produces $12K, 12 W droplets/0.5s.")
.setDifficulty(Difficulty.Exist)
.setPrice(new Price().setCost("Funds", new InfiniteMath([920, 12])).setCost("Power", 740000), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([2.92, 15])).setCost("Power", 1520000), 2)

.addPlaceableArea(AREAS.BarrenIslands)
.setDroplet(Droplet.RapidDroplet)
.setDropRate(2)

.onLoad((model) => {
    for (const part of model.GetChildren()) {
        if (part.Name === "Color" && part.IsA("BasePart"))
            rainbowEffect(part, 3)
    }
});