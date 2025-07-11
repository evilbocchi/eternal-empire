import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Gold from "shared/items/excavation/Gold";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Upgrader(script.Name)
    .setName("Heavy Foundry")
    .setDescription("A large furnace that's less of a furnace and more like an oven. Has a %mul% boost, but reduces 0.1 for each blocked vent.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setRequiredItemAmount(WhiteGem, 20)
    .setRequiredItemAmount(Gold, 1)
    .setPrice(new Price().setCost("Funds", 10e27), 1)
    .markPlaceableEverywhere()
    .setCreator("simple13579")

    .setSpeed(3)
    .setMul(new Price().setCost("Funds", 1.2))
    .onLoad((model, item) => {
        const vents = new Array<BasePart>();
        for (const vent of model.GetChildren()) {
            if (vent.Name !== "VentHitbox" || !vent.IsA("BasePart"))
                continue;
            vent.Touched.Connect(() => { });
            vents.push(vent);
        }
        item.repeat(model, () => {
            let touchingCount = 0;
            for (const vent of vents) {
                const touchingParts = vent.GetTouchingParts();
                for (const touchingPart of touchingParts)
                    if (touchingPart.Name === "Hitbox") {
                        ++touchingCount;
                        continue;
                    }
            }
            item.setMul(new Price().setCost("Funds", 1.2 - touchingCount * 0.1));
        }, 1);
    });