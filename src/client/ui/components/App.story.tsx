import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BackpackManager from "client/ui/components/backpack/BackpackManager";
import BalanceWindow from "client/ui/components/balance/BalanceWindow";
import BuildManager from "client/ui/components/build/BuildManager";
import ClickSparkManager from "client/ui/components/effect/ClickSparkManager";
import InventoryWindow from "client/ui/components/inventory/InventoryWindow";
import MainLayout from "client/ui/components/MainLayout";
import { questState } from "client/ui/components/quest/QuestState";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import SettingsManager from "client/ui/components/settings/SettingsManager";
import StoryMocking from "client/ui/components/StoryMocking";
import { TooltipDisplay } from "client/ui/components/tooltip/TooltipManager";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            hasItems: true,
        },
    },
    (props) => {
        StoryMocking.mockData();
        questState.setTrackedQuest("Quest1");

        if (!props.controls.hasItems) {
            Packets.inventory.set(new Map());
        }

        return (
            <StrictMode>
                <MainLayout />
                <ClickSparkManager />
                <TooltipDisplay />
                <BuildManager />
                <SettingsManager />
                <InventoryWindow />
                <QuestWindow />
                <BackpackManager />
                <BalanceWindow />
            </StrictMode>
        );
    },
);
