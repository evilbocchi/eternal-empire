import Difficulty from "@antivivi/jjt-difficulties";
import { getInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import setDropletVelocity from "shared/item/utils/setDropletVelocity";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import Quartz from "shared/items/excavation/Quartz";

export = new Item(script.Name)
    .setName("Droplet Ascender")
    .setDescription("Moves droplets directly to the sky level.")
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Funds", 60), 1)
    .setPrice(new CurrencyBundle().set("Funds", 60e21), 2)
    .setPrice(new CurrencyBundle().set("Funds", 60e42), 3)
    .setPrice(new CurrencyBundle().set("Funds", 60e63), 4)
    .setPrice(new CurrencyBundle().set("Funds", 60e84), 5)
    .setRequiredItemAmount(Quartz, 1)
    .setRequiredItemAmount(MagicalWood, 20)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")

    .trait(Conveyor)
    .setSpeed(5)

    .trait(Upgrader)
    .setSky(true)

    .exit()

    .onLoad((model) => {
        const forward = model.GetPivot().LookVector.Unit;
        getInstanceInfo(model, "OnUpgraded")!.connect((droplet) => {
            const baseDirection = forward.mul(12).add(new Vector3(0, 49, 0)).Unit;
            setDropletVelocity(droplet, baseDirection.mul(50));
        });
    });
