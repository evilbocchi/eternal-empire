import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory, EnumList } from "@rbxts/ui-labs";
import { ChooseOptionType } from "@rbxts/ui-labs/src/ControlTypings/Advanced";
import PurchaseWindow from "client/ui/components/item/shop/PurchaseWindow";
import ShopGui from "client/ui/components/item/shop/ShopGui";
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
            shop: EnumList(shops, ClassLowerNegativeShop.name),
        },
    },
    (props) => {
        StoryMocking.mockData();

        const item = Items.getItem(props.controls.shop as string) ?? ClassLowerNegativeShop;
        const shop = item.findTrait("Shop")!;
        const viewportManagement = useCIViewportManagement({ enabled: true });

        const [adornee, setAdornee] = React.useState<Part | undefined>(undefined);
        useEffect(() => {
            const part = new Instance("Part");
            part.Color = Color3.fromRGB(27, 42, 53);
            part.Size = new Vector3(20, 11, 0.5);
            part.Anchored = true;
            part.Position = new Vector3(0, 5, 0);
            part.Parent = Workspace;
            setAdornee(part);

            return () => part.Destroy();
        }, []);

        useEffect(() => {
            const settings = Packets.settings.get();
            settings.HideMaxedItems = props.controls.hideMaxedItems;
            Packets.settings.set(settings);
        }, [props.controls.hideMaxedItems]);

        return (
            <StrictMode>
                <TooltipWindow />
                <ShopGui shop={shop} adornee={adornee} viewportManagement={viewportManagement} />
                <PurchaseWindow viewportManagement={viewportManagement} />
            </StrictMode>
        );
    },
);
