import Difficulty from "@rbxts/ejt";
import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import Item from "shared/item/Item";
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
        const inaccessibleItems = new Set<Item>();
        for (const item of Items.sortedItems) {
            if (item.difficulty === Difficulty.Bonuses) continue;
            inaccessibleItems.add(item);
        }
        for (const item of Items.sortedItems) {
            const shop = item.findTrait("Shop");
            if (shop) {
                for (const entry of shop.items) {
                    inaccessibleItems.delete(entry);
                }
            }
        }
        print("Inaccessible items:");
        for (const item of inaccessibleItems) {
            print(`- ${item.name}`);
        }

        return <Fragment />;
    },
);
