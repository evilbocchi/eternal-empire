import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Gold from "shared/items/excavation/Gold";
import WhiteGem from "shared/items/excavation/WhiteGem";
import WIPUpgrader from "shared/items/negative/felixthea/WIPUpgrader";

export = new Item(script.Name)
    .setName("Heavy Foundry")
    .setDescription(
        "A large furnace that's less of a furnace and more like an oven. Has a %mul% boost, but reduces 0.1 for each blocked vent.",
    )
    .setDifficulty(Difficulty.Blessing)
    .setRequiredItemAmount(WIPUpgrader, 1)
    .setRequiredItemAmount(WhiteGem, 20)
    .setRequiredItemAmount(Gold, 1)
    .setPrice(new CurrencyBundle().set("Funds", 10e27), 1)
    .placeableEverywhere()
    .setCreator("simple13579")
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.2))

    .trait(Conveyor)
    .setSpeed(3)
    .exit()

    .onLoad((model, item) => {
        const upgrader = item.trait(Upgrader);

        const vents = new Array<BasePart>();
        for (const vent of model.GetChildren()) {
            if (vent.Name !== "VentHitbox" || !vent.IsA("BasePart")) continue;
            vent.CanTouch = true;
            vent.Touched.Connect(() => {});
            vents.push(vent);
        }
        item.repeat(
            model,
            () => {
                let touchingCount = 0;
                for (const vent of vents) {
                    const touchingParts = vent.GetTouchingParts();
                    for (const touchingPart of touchingParts)
                        if (touchingPart.Name === "Hitbox") {
                            ++touchingCount;
                            continue;
                        }
                }
                upgrader.setMul(new CurrencyBundle().set("Funds", 1.2 - touchingCount * 0.1));
            },
            1,
        );
    });
