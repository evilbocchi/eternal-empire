import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import Item from "shared/item/Item";
import Items from "shared/items/Items";

/**
 * This story prints out all items that are not in any shop.
 */
export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        const itemsInShop = new Set<Item>();
        for (const item of Items.sortedItems) {
            const shop = item.findTrait("Shop");
            if (!shop) continue;

            for (const shopItem of shop.items) {
                itemsInShop.add(shopItem);
            }
        }
        for (const item of Items.sortedItems) {
            if (item.findTrait("Shop")) continue;
            if (itemsInShop.has(item)) continue;
            print(item.id);
        }

        return <Fragment />;
    },
);
