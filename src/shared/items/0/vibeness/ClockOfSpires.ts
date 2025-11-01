import Difficulty from "@rbxts/ejt";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Lighting } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Boostable from "shared/item/traits/boost/Boostable";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Clock Of Spires")
    .setDescription("The chime of endless growth. Upgrades Funds by 4x during the day, and Power by 4x at night.")
    .setDifficulty(Difficulty.Vibeness)
    .setPrice(new CurrencyBundle().set("Funds", 2.5e42), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Upgrader)

    .trait(Conveyor)
    .setSpeed(5)

    .exit()

    .onLoad((model, item) => {
        const modelInfo = getAllInstanceInfo(model);
        const modifier: ItemBoost = {
            ignoresLimitations: false,
            upgradeCompound: {
                mul: new CurrencyBundle().set("Funds", 1),
            },
        };

        Boostable.addBoost(modelInfo, "DayNightClock", modifier);

        const updateMultiplier = () => {
            const clock = Lighting.ClockTime;
            const isDay = clock >= 6 && clock < 18;
            modifier.upgradeCompound!.mul = isDay
                ? new CurrencyBundle().set("Funds", 4)
                : new CurrencyBundle().set("Power", 4);
        };

        updateMultiplier();
        item.repeat(model, updateMultiplier, 1);
    });
