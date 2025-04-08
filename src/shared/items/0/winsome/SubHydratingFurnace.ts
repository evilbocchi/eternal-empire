import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import { GameUtils } from "shared/item/ItemUtils";

let meetsRequirement = false;
const requirement = new OnoeNum(10);

export = new Item(script.Name)
    .setName("Sub-Hydrating Furnace")
    .setDescription("Processes droplets for x2 Funds value, but is x5 with more than 10 Skill.")
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Skill", 2).set("Funds", 10e24), 1)
    .addPlaceableArea("SlamoVillage")

    .trait(Furnace)
    .exit()

    .onInit((item) => {
        const furnace = item.trait(Furnace);

        const CurrencyService = GameUtils.currencyService;
        item.repeat(undefined, () => {
            const skill = CurrencyService.get("Skill");
            meetsRequirement = skill !== undefined && !skill.lessThan(requirement);
            const mul = new OnoeNum(meetsRequirement ? 5 : 2);
            furnace.setMul(new CurrencyBundle().set("Funds", mul));
        }, 0.5);
    })
    .onLoad((model, item) => {
        const children = model.GetChildren();
        for (const glow of children) {
            if (glow.IsA("BasePart") && glow.Name === "Glow") {
                item.repeat(model, () => glow.Transparency = meetsRequirement ? 0 : 0.5);
            }
        }
    });