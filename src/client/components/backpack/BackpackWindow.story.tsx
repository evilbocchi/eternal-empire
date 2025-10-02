import React, { StrictMode, useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import BackpackWindow from "client/components/backpack/BackpackWindow";
import HarvestableGuiRenderer from "client/components/item/HarvestableGuiRenderer";
import StoryMocking from "client/components/StoryMocking";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import useVisibility from "client/hooks/useVisibility";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import HARVESTABLES from "shared/world/harvestable/Harvestable";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        StoryMocking.mockData();
        StoryMocking.mockCharacter();
        useVisibility("Backpack", props.controls.visible);

        const [models, setModels] = useState(new Array<PVInstance>());

        useEffect(() => {
            let i = 0;
            const container = new Instance("Folder");
            container.Name = "Harvestable";
            container.Parent = Workspace;

            const newModels = new Array<PVInstance>();
            for (const [id, harvestable] of pairs(HARVESTABLES)) {
                const item = Items.getItem(id as string);
                if (!item) continue;

                const harvestableModel = item.createModel({
                    item: item.id,
                    posX: 0,
                    posY: 200,
                    posZ: i * 20,
                    rotX: 0,
                    rotY: 0,
                    rotZ: 0,
                });
                if (!harvestableModel) continue;

                harvestableModel.SetAttribute("Health", harvestable.health);
                harvestableModel.Parent = container;
                newModels.push(harvestableModel);
                i++;
            }
            setModels(newModels);
            return () => {
                container.Destroy();
            };
        }, []);

        Packets.useTool.fromClient((player, harvestable) => {
            harvestable.SetAttribute("Health", (harvestable.GetAttribute("Health") as number) - math.random(5, 100));
        });

        return (
            <StrictMode>
                <BackpackWindow />
                <HarvestableGuiRenderer overrideModels={models} />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
