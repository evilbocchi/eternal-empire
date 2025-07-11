import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

const mul = new Price();

export = new Upgrader(script.Name)
    .setName("Chromatic Maze")
    .setDescription("Boosts Funds and Power gain by Bitcoin! Pass droplets through each ring with an elevated conveyor to compound the boost. Though, this is easier said than done...")
    .setDifficulty(Difficulty.Ifinitude)
    .setPrice(new Price().setCost("Bitcoin", 1e6).setCost("Skill", 15), 1)
    .setRequiredItemAmount(AdvancedBlankEssence, 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().pow(0.01))
    .setFormulaX("bitcoin")
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v).setCost("Power", v)), () => GameUtils.currencyService.getCost("Bitcoin"))
    .onClientLoad((model) => {
        for (const part of model.GetChildren())
            if (part.Name === "Color" && part.IsA("BasePart"))
                rainbowEffect(part, 2);
    });