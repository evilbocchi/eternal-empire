import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import Items from "shared/items/Items";

/**
 * This story prints all poly parts in workspace descendants that are collidable and not named Ghost/Decoration.
 */
export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        const fullInventory = new Map<string, number>();
        for (const item of Items.sortedItems) {
            fullInventory.set(item.id, item.pricePerIteration.size());

            for (const [requiredItem, amount] of item.requiredItems) {
                const currentAmount = fullInventory.get(requiredItem) ?? 0;
                fullInventory.set(requiredItem, currentAmount - amount);
            }
        }
        for (const [itemId, amount] of fullInventory) {
            if (amount <= 0) continue;
            print(`${itemId}: ${amount}`);
        }

        return <Fragment />;
    },
);
