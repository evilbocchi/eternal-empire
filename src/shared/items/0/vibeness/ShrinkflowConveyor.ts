import Difficulty from "@antivivi/jjt-difficulties";
import { getInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";
import Jade from "shared/items/excavation/Jade";
import Quartz from "shared/items/excavation/Quartz";

export = new Item(script.Name)
    .setName("Shrinkflow Conveyor")
    .setDescription("Shrinks your droplets to a smaller size, but lowers its value by x0.9 on ALL currencies.")
    .setDifficulty(Difficulty.Vibeness)
    .setPrice(new CurrencyBundle().set("Dark Matter", 1e27), 1)
    .setRequiredItemAmount(Jade, 1)
    .setRequiredItemAmount(Quartz, 1)
    .setCreator("superGirlygamer8o")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .persists()

    .trait(Conveyor)
    .setSpeed(5)
    
    .trait(Upgrader)
    .setMul(CurrencyBundle.ones().mul(0.9))
    .exit()

    .onLoad((model) => {
        getInstanceInfo(model, "OnUpgraded")!.connect((droplet) => {
            droplet.Size = droplet.Size.mul(0.75);
        });
    });