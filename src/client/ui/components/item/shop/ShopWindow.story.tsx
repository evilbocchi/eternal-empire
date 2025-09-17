import React, { StrictMode, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import ShopWindow from "client/ui/components/item/shop/ShopWindow";
import Item from "shared/item/Item";
import TheFirstConveyor from "shared/items/negative/tfd/TheFirstConveyor";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import TheFirstFurnace from "shared/items/negative/tfd/TheFirstFurnace";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {},
    },
    () => {
        const [selectedItem, setSelectedItem] = useState<Item | undefined>();

        const itemCount = 3;
        const shopItems = [];
        const mockItems = [TheFirstDropper, TheFirstConveyor, TheFirstFurnace];
        for (let i = 0; i < math.min(itemCount, mockItems.size()); i++) {
            const item = mockItems[i];
            shopItems.push({
                item,
                amountText: `$${100 * (i + 1)}`,
                amountColor: Color3.fromRGB(255, 255, 255),
                isMaxed: false,
                layoutOrder: i,
            });
        }

        const handleItemSelect = (item: Item) => {
            setSelectedItem(item);
        };

        const handleBuyAll = () => {
            print("Buy all items!");
        };

        return (
            <StrictMode>
                <frame Size={new UDim2(0, 800, 0, 600)} BackgroundTransparency={1}>
                    <ShopWindow
                        shopItems={shopItems}
                        selectedItem={selectedItem}
                        isPurchaseWindowVisible={selectedItem !== undefined}
                        onItemSelect={handleItemSelect}
                        onBuyAll={handleBuyAll}
                        shopColor={Color3.fromRGB(85, 255, 127)}
                    />
                </frame>
            </StrictMode>
        );
    },
);
