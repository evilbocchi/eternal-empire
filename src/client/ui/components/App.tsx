import React, { StrictMode } from "@rbxts/react";
import BackpackWindow from "client/ui/components/backpack/BackpackWindow";
import BalanceWindow from "client/ui/components/balance/BalanceWindow";
import BuildWindow from "client/ui/components/build/BuildWindow";
import ClickSparkManager from "client/ui/components/effect/ClickSparkManager";
import InventoryWindow from "client/ui/components/item/inventory/InventoryWindow";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import MainLayout from "client/ui/components/MainLayout";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import SettingsManager from "client/ui/components/settings/SettingsManager";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import WorldRenderer from "client/ui/components/world/WorldRenderer";

export default function App({ viewportsEnabled }: { viewportsEnabled: boolean }) {
    const viewportManagement = useCIViewportManagement({ enabled: viewportsEnabled });

    return (
        <StrictMode>
            <MainLayout />
            <ClickSparkManager />
            <TooltipWindow />
            <BuildWindow />
            <SettingsManager />
            <InventoryWindow viewportManagement={viewportManagement} />
            <QuestWindow />
            <BackpackWindow />
            <BalanceWindow />
            <WorldRenderer />
        </StrictMode>
    );
}
