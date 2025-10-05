import Difficulty from "@rbxts/ejt";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Leg Powered Upgrader")
    .setDescription(
        "Run on the treadmill to activate this upgrader. While powered, increases droplet value by %mul%. Requires effort!",
    )
    .setDifficulty(Difficulty.PressAKey)
    .setPrice(new CurrencyBundle().set("Skill", 1500), 1)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 2))

    .trait(Conveyor)
    .setSpeed(8)
    .exit()

    .onLoad((model, item) => {
        const thitbox = model.WaitForChild("TreadmillHitbox") as BasePart;
        thitbox.CanTouch = true;
        eat(thitbox.Touched.Connect(() => {}));

        const modelInfo = getAllInstanceInfo(model);
        const modifier: ItemBoost = {
            ignoresLimitations: false,
            upgradeCompound: {
                mul: new CurrencyBundle().set("Funds", 0),
            },
        };
        Boostable.addBoost(modelInfo, "Treadmill", modifier);

        item.repeat(
            model,
            () => {
                const touchingParts = thitbox.GetTouchingParts();
                let hasCharacter = false;
                for (const part of touchingParts) {
                    const humanoid = part.Parent?.FindFirstChildOfClass("Humanoid");
                    if (humanoid !== undefined) {
                        hasCharacter = true;
                        break;
                    }
                }
                modifier.upgradeCompound!.mul = hasCharacter
                    ? new CurrencyBundle().set("Funds", 1)
                    : new CurrencyBundle().set("Funds", 0);
            },
            0.5,
        );
    });
