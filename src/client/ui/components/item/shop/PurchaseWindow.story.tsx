import React, { StrictMode, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import PurchaseWindow from "client/ui/components/item/shop/PurchaseWindow";
import { useSingleDocumentVisibility } from "client/ui/hooks/useVisibility";
import CoalescentRefiner from "shared/items/0/ifinitude/CoalescentRefiner";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        const [purchased, setPurchased] = useState(false);

        useSingleDocumentVisibility("Purchase", props.controls.visible);

        const handlePurchase = () => {
            print("Purchasing item!");
            setPurchased(true);
        };

        const priceOptions = [
            {
                currency: "Funds" as Currency,
                amount: "500",
                affordable: true,
            },
            {
                currency: "Power" as Currency,
                amount: "100",
                affordable: true,
            },
        ];

        const mockItem = CoalescentRefiner;

        return (
            <StrictMode>
                <PurchaseWindow
                    item={mockItem}
                    description={purchased ? "Already purchased!" : mockItem.description}
                    creator={mockItem.creator}
                    priceOptions={priceOptions}
                    owned={purchased ? 1 : 0}
                    canPurchase={true}
                    affordable={true}
                    onPurchase={handlePurchase}
                    strokeColor={mockItem.difficulty?.color ?? Color3.fromRGB(255, 255, 255)}
                />
            </StrictMode>
        );
    },
);
