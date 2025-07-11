import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import Price from "shared/Price";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Upgrader(script.Name)
.setName("Mechnical Enhancer")
.setDescription("Built by a Chief Slamo with the assistance of a grey-and-yellow traveller; The result is a highly unstable machine of.. varying usefulness. %pow% gain to droplets, your very first exponential upgrader. When using this, you will need to sacrifice %drain%, however.")
.setDifficulty(Difficulty.Ifinitude)
.setPrice(new Price().setCost("Funds", 4e33).setCost("Skill", 50), 1)
.setRequiredItemAmount(AdvancedBlankEssence, 1)
.addPlaceableArea("BarrenIslands")

.setSpeed(4)
.setDrain(new Price().setCost("Skill", 0.5))
.setPow(new Price().setCost("Funds", 1.02))
.onClientLoad((model) => {
    for (const part of model.GetChildren())
        if (part.Name === "Glow" && part.IsA("BasePart"))
            rainbowEffect(part, 2);
});