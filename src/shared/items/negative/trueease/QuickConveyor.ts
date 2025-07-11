import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Conveyor("QuickConveyor")
.setName("Quick Conveyor")
.setDescription("Less droplets in a single moment means less worry about droplet limits. Transports droplets at a quicker rate than all previous conveyors!")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Funds", 200e9), 1, 10)
.addPlaceableArea("BarrenIslands")

.setSpeed(8)
.onLoad((model) => {
    for (const c of model.GetChildren()) {
        if (c.Name === "Color" && c.IsA("BasePart"))
            rainbowEffect(c, 2);
    }
});