import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Conveyor("QuickConveyor")
.setName("Quick Conveyor")
.setDescription("Less droplets in a single moment means less worry about droplet limits. Transports droplets at a quicker rate than all previous conveyors!")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Funds", new InfiniteMath([200, 9])), 1, 10)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(8)
.onLoad((model) => {
    for (const c of model.GetChildren()) {
        if (c.Name === "Color" && c.IsA("BasePart"))
            rainbowEffect(c, 2);
    }
});