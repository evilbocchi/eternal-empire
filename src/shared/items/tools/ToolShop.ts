import Difficulty from "@antivivi/jjt-difficulties";
import HarvestingTool from "shared/item/HarvestingTool";
import Shop from "shared/item/Shop";

const ToolShop = new Shop(script.Name)
.setName("Tool Shop")
.setDifficulty(Difficulty.Miscellaneous);

const tools = new Map<ToolType, Array<HarvestingTool>>();
for (const module of script.Parent!.GetChildren()) {
    if (module.IsA("ModuleScript") && module !== script) {
        const tool = require(module) as HarvestingTool;
        const curr = tools.get(tool.toolType) ?? [];
        curr.push(tool);
        tools.set(tool.toolType, curr);
    }
}
for (const [_, toolList] of tools) {
    for (const tool of toolList)
        ToolShop.items.push(tool);
}
export = ToolShop;