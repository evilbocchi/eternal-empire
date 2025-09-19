import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BackpackWindow from "client/ui/components/backpack/BackpackWindow";
import BalanceWindow from "client/ui/components/balance/BalanceWindow";
import BuildManager from "client/ui/components/build/BuildManager";
import ClickSparkManager from "client/ui/components/effect/ClickSparkManager";
import InventoryWindow from "client/ui/components/item/inventory/InventoryWindow";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import MainLayout from "client/ui/components/MainLayout";
import { questState } from "client/ui/components/quest/QuestState";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import SettingsManager from "client/ui/components/settings/SettingsManager";
import StoryMocking from "client/ui/components/StoryMocking";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import { useVisibilityMain } from "client/ui/hooks/useVisibility";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            hasItems: true,
            viewportsEnabled: false,
        },
    },
    (props) => {
        StoryMocking.mockData();
        questState.setTrackedQuest("Quest1");

        if (!props.controls.hasItems) {
            Packets.inventory.set(new Map());
        }

        const viewportManagement = useCIViewportManagement({ enabled: props.controls.viewportsEnabled });

        useVisibilityMain(props.controls.visible);

        return (
            <StrictMode>
                <MainLayout />
                <ClickSparkManager />
                <TooltipWindow />
                <BuildManager />
                <SettingsManager />
                <InventoryWindow viewportManagement={viewportManagement} />
                <QuestWindow />
                <BackpackWindow />
                <BalanceWindow />
            </StrictMode>
        );
    },
);
