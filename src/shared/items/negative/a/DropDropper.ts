import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import Furnace from "shared/item/traits/Furnace";
import { getInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";

export = new Item(script.Name)
    .setName("Recycling Dropper")
    .setDescription(
        "Produces a %val% droplet every time a droplet is processed through the attached furnace. No need for conjoined droppers anymore.",
    )
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Funds", 6.5e12), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.CommunismDroplet)

    .trait(Furnace)
    .setMul(CurrencyBundle.ones().mul(0))
    .exit()

    .onLoad((model) => {
        setInstanceInfo(model, "FurnaceProcessed", () => {
            getInstanceInfo(model.WaitForChild("Drop"), "Instantiator")?.();
        });
    });
