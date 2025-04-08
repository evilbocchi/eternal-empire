import Difficulty from "@antivivi/jjt-difficulties";
import HarvestingTool from "shared/item/traits/HarvestingTool";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";

const ToolShop = new Item(script.Name)
    .setName("Tool Shop")
    .setDifficulty(Difficulty.Miscellaneous);

const tools = new Map<ToolType, Array<HarvestingTool>>();
for (const module of script.Parent!.GetChildren()) {
    if (module.IsA("ModuleScript") && module !== script) {
        const item = require(module) as Item;
        const harvestingTool = item.trait(HarvestingTool);

        const curr = tools.get(harvestingTool.toolType) ?? [];
        curr.push(harvestingTool);
        tools.set(harvestingTool.toolType, curr);
    }
}
const shop = ToolShop.trait(Shop);

for (const [_, toolList] of tools) {
    const sorted = toolList.sort((a, b) => a.item.difficulty.rating! < b.item.difficulty.rating!);

    for (const tool of sorted)
        shop.items.push(tool.item);
}
export = ToolShop;