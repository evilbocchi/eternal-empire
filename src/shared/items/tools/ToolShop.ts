import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Gear from "shared/item/traits/Gear";
import Shop from "shared/item/traits/Shop";

const ToolShop = new Item(script.Name).setName("Tool Shop").setDifficulty(Difficulty.Bonuses);

let tools = new Array<Gear>();
for (const module of script.Parent!.GetChildren()) {
    if (module.IsA("ModuleScript") && module !== script) {
        const item = require(module) as Item;
        const gear = item.trait(Gear);
        tools.push(gear);
    }
}
const shop = ToolShop.trait(Shop);

// sort by tier first, then by name
tools = tools.sort((a, b) => {
    const aRating = a.item.difficulty.layoutRating!;
    const bRating = b.item.difficulty.layoutRating!;
    if (aRating !== bRating) {
        return aRating < bRating;
    }

    return a.item.name < b.item.name;
});
for (const tool of tools) {
    shop.items.push(tool.item);
}

export = ToolShop;
