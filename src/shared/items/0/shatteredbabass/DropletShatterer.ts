import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/Dropper";
import Furnace from "shared/item/traits/Furnace";
import { getInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";

export = new Item(script.Name)
    .setName("Droplet Shatterer")
    .setDescription("Produces a %val% droplet every time a droplet is processed through the attached furnace.")
    .setDifficulty(Difficulty.ShatteredBabass)
    .setPrice(new CurrencyBundle().set("Power", 70e24), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.ShatteredDroplet)

    .trait(Furnace)
    .exit()

    .onLoad((model) => {
        setInstanceInfo(model, "OnProcessed", () => {
            getInstanceInfo(model.WaitForChild("Drop"), "Instantiator")?.();
        });
    });