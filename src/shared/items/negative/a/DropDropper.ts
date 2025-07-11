import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Price from "shared/Price";
import { GameUtils } from "shared/utils/ItemUtils";

export = new Dropper(script.Name)
    .setName("Recycling Dropper")
    .setDescription("Produces a %val% droplet every time a droplet is processed through the attached furnace. No need for conjoined droppers anymore.")
    .setDifficulty(Difficulty.A)
    .setPrice(new Price().setCost("Funds", 6.5e12), 1)

    .addPlaceableArea("BarrenIslands")
    .setDroplet(Droplet.CommunismDroplet)
    .onProcessed((model) => {
        const instantiator = GameUtils.getInstanceInfo(model.WaitForChild("Drop") as BasePart, "Instantiator");
        if (instantiator !== undefined) {
            instantiator();
        }
    });