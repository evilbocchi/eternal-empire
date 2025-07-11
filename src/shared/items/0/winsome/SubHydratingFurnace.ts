import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import Price from "shared/Price";
import Furnace from "shared/item/Furnace";
import { GameUtils } from "shared/utils/ItemUtils";

let meetsRequirement = false;
const requirement = new OnoeNum(10);

export = new Furnace(script.Name)
    .setName("Sub-Hydrating Furnace")
    .setDescription("Processes droplets for x2 Funds value, but is x5 with more than 10 Skill.")
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new Price().setCost("Skill", 2).setCost("Funds", 10e24), 1)
    .addPlaceableArea("SlamoVillage")

    .onInit((item) => {
        const CurrencyService = GameUtils.currencyService;
        item.repeat(undefined, () => {
            const skill = CurrencyService.getCost("Skill");
            meetsRequirement = skill !== undefined && !skill.lessThan(requirement);
            const mul = new OnoeNum(meetsRequirement ? 5 : 2);
            item.setMul(new Price().setCost("Funds", mul));
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