import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Furnace from "shared/item/Furnace";
import { OnoeNum } from "@antivivi/serikanum";

let meetsRequirement = false;
const requirement = new OnoeNum(10);

export = new Furnace("SubHydratingFurnace")
.setName("Sub-Hydrating Furnace")
.setDescription("Processes droplets for 2x Funds value, but is 5x with more than 10 Skill.")
.setDifficulty(Difficulty.Winsome)
.setPrice(new Price().setCost("Skill", 6), 1)
.addPlaceableArea("SlamoVillage")

.onInit((utils, item) => {
    item.repeat(undefined, () => {
        const skill = utils.getBalance().getCost("Skill");
        meetsRequirement = skill !== undefined && !skill.lessThan(requirement);
        const mul = new OnoeNum(meetsRequirement ? 5 : 2);
        item.setMul(new Price().setCost("Funds", mul));
    }, 0.5);
})
.onLoad((model, _utils, item) => {
    const children = model.GetChildren();
    for (const glow of children) {
        if (glow.IsA("BasePart") && glow.Name === "Glow") {
            item.repeat(model, () => glow.Transparency = meetsRequirement ? 0 : 0.5);
        }
    }
});