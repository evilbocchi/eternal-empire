import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox, { createRoot } from "@rbxts/react-roblox";
import { StarterGui, Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import PurchaseWindow from "client/ui/components/item/shop/PurchaseWindow";
import ShopWindow from "client/ui/components/item/shop/ShopWindow";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            onSurface: false,
        },
    },
    (props) => {
        const handleBuyAll = () => {
            print("Buy all items!");
        };

        const shopWindow = <ShopWindow shop={ClassLowerNegativeShop.findTrait("Shop")!} onBuyAll={handleBuyAll} />;

        useEffect(() => {
            if (!props.controls.onSurface) return;
            const part = new Instance("Part");
            part.Color = Color3.fromRGB(27, 42, 53);
            part.Size = new Vector3(20, 11, 0.5);
            part.Anchored = true;
            part.Position = new Vector3(0, 5, 0);
            part.Parent = Workspace;
            const surfaceGui = new Instance("SurfaceGui");
            surfaceGui.Face = Enum.NormalId.Front;
            surfaceGui.Adornee = part;
            surfaceGui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
            surfaceGui.PixelsPerStud = 50;
            surfaceGui.ClipsDescendants = true;
            surfaceGui.Parent = StarterGui;
            const root = createRoot(surfaceGui);
            root.render(shopWindow);
            return () => {
                root.unmount();
                surfaceGui.Destroy();
                part.Destroy();
            };
        }, [props.controls.onSurface, shopWindow]);

        return (
            <StrictMode>
                <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} ZIndex={-10}>
                    {!props.controls.onSurface && shopWindow}
                </frame>
                <PurchaseWindow />
            </StrictMode>
        );
    },
);
