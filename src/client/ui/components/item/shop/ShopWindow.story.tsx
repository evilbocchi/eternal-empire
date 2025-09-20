import React, { StrictMode, useEffect, useMemo, useState } from "@rbxts/react";
import ReactRoblox, { createRoot } from "@rbxts/react-roblox";
import { StarterGui, Workspace } from "@rbxts/services";
import { CreateReactStory, EnumList } from "@rbxts/ui-labs";
import { ChooseOptionType } from "@rbxts/ui-labs/src/ControlTypings/Advanced";
import PurchaseWindow from "client/ui/components/item/shop/PurchaseWindow";
import ShopWindow from "client/ui/components/item/shop/ShopWindow";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import StoryMocking from "client/ui/components/StoryMocking";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import Items from "shared/items/Items";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import Packets from "shared/Packets";

const shops: Record<string, ChooseOptionType> = {};
for (const item of Items.sortedItems) {
    if (item.findTrait("Shop") !== undefined) {
        shops[item.name] = item.id;
    }
}

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            hideMaxedItems: false,
            onSurface: false,
            shop: EnumList(shops, ClassLowerNegativeShop.name),
        },
    },
    (props) => {
        StoryMocking.mockData();

        const item = Items.getItem(props.controls.shop as string) ?? ClassLowerNegativeShop;
        const shop = item.findTrait("Shop")!;
        const viewportManagement = useCIViewportManagement({ enabled: true });
        const shopWindow = <ShopWindow shop={shop} viewportManagement={viewportManagement} />;

        const [surfaceGui, setSurfaceGui] = useState<SurfaceGui>();
        useEffect(() => {
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
            surfaceGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
            surfaceGui.PixelsPerStud = 50;
            surfaceGui.ClipsDescendants = true;
            surfaceGui.Parent = StarterGui;
            setSurfaceGui(surfaceGui);

            return () => part.Destroy();
        }, []);

        const root = useMemo(() => {
            if (!surfaceGui) return;
            return createRoot(surfaceGui);
        }, [surfaceGui]);

        useEffect(() => {
            if (!props.controls.onSurface || !root || !surfaceGui) return;
            root.render(shopWindow);
            return () => {
                root.unmount();
            };
        }, [props.controls.onSurface, root, item]);

        useEffect(() => {
            const settings = Packets.settings.get();
            settings.HideMaxedItems = props.controls.hideMaxedItems;
            Packets.settings.set(settings);
        }, [props.controls.hideMaxedItems]);

        return (
            <StrictMode>
                <TooltipWindow />
                <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} ZIndex={-10}>
                    {!props.controls.onSurface && shopWindow}
                </frame>
                <PurchaseWindow viewportManagement={viewportManagement} />
            </StrictMode>
        );
    },
);
