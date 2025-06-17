import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import HarvestingTool from "shared/item/traits/HarvestingTool";
import Shop from "shared/item/traits/Shop";

const ToolShop = new Item(script.Name)
    .setName("Tool Shop")
    .setDifficulty(Difficulty.Miscellaneous);

let tools = new Array<HarvestingTool>();
for (const module of script.Parent!.GetChildren()) {
    if (module.IsA("ModuleScript") && module !== script) {
        const item = require(module) as Item;
        const harvestingTool = item.trait(HarvestingTool);
        tools.push(harvestingTool);
    }
}
const shop = ToolShop.trait(Shop);

// sort by tier first, then by name
tools = tools.sort((a, b) => {
    const aRating = a.item.difficulty.rating!;
    const bRating = b.item.difficulty.rating!;
    if (aRating !== bRating) {
        return aRating < bRating;
    }

    return a.item.name < b.item.name;
});
for (const tool of tools) {
    shop.items.push(tool.item);
}

export = ToolShop;