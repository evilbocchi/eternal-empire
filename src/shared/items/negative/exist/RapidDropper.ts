import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Price from "shared/Price";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Dropper(script.Name)
.setName("Rapid Dropper")
.setDescription("Pew pew pew... or something. Produces %val% droplets every 0.5 seconds.")
.setDifficulty(Difficulty.Exist)
.setPrice(new Price().setCost("Funds", 920e12).setCost("Power", 740000), 1)
.setPrice(new Price().setCost("Funds", 2.92e15).setCost("Power", 1520000), 2)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.RapidDroplet)
.setDropRate(2)

.onLoad((model) => {
    for (const part of model.GetChildren()) {
        if (part.Name === "Color" && part.IsA("BasePart"))
            rainbowEffect(part, 3)
    }
});