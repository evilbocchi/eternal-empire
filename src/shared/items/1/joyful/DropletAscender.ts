import { getAllInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import setDropletVelocity from "shared/item/utils/setDropletVelocity";
import Class1Shop from "shared/items/1/Class1Shop";
import Quartz from "shared/items/excavation/Quartz";
import MagicalWood from "shared/items/negative/tlg/MagicalWood";

export = new Item(script.Name)
    .setName("Droplet Ascender")
    .setDescription("Moves droplets directly to the sky level.")
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Funds", 60), 1)
    .setPrice(new CurrencyBundle().set("Funds", 60e24), 2)
    .setPrice(new CurrencyBundle().set("Funds", 60e48), 3)
    .setPrice(new CurrencyBundle().set("Funds", 60e72), 4)
    .setPrice(new CurrencyBundle().set("Funds", 60e96), 5)
    .setRequiredItemAmount(Quartz, 1)
    .setRequiredItemAmount(MagicalWood, 20)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class1Shop)

    .trait(Conveyor)
    .setSpeed(5)

    .trait(Upgrader)
    .setSky(true)

    .exit()

    .onLoad((model) => {
        const forward = model.GetPivot().LookVector.Unit;
        const modelInfo = getAllInstanceInfo(model);
        const onUpgraded = modelInfo.upgraderTriggered;
        if (onUpgraded === undefined)
            throw `Tried to load Droplet Ascender on model without OnUpgraded event: ${model.GetFullName()}`;

        onUpgraded.connect((droplet) => {
            const baseDirection = forward.mul(12).add(new Vector3(0, 49, 0)).Unit;
            setDropletVelocity(droplet, baseDirection.mul(50));
        });
    });
