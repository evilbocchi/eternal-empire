import { Controller, OnStart } from "@flamework/core";
import React, { Fragment } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import {
    BACKPACK_GUI,
    BALANCE_GUI,
    BUILD_GUI,
    CLICK_SPARKS_GUI,
    DIALOGUE_GUI,
    HAMSTER_GUI,
    INVENTORY_GUI,
    LOGS_GUI,
    MAIN_LAYOUT_GUI,
    PURCHASE_GUI,
    QUESTS_GUI,
    SETTINGS_GUI,
    SHOP_GUI,
    STATS_GUI,
    TOOLTIPS_GUI,
    WORLD_GUI,
} from "client/controllers/core/Guis";
import BuildController from "client/controllers/gameplay/BuildController";
import InventoryController from "client/controllers/interface/InventoryController";
import MainLayout from "client/ui/components/MainLayout";
import BackpackWindow from "client/ui/components/backpack/BackpackWindow";
import BalanceWindow from "client/ui/components/balance/BalanceWindow";
import BuildManager from "client/ui/components/build/BuildManager";
import CommandsWindow from "client/ui/components/commands/CommandsWindow";
import ClickSparkManager from "client/ui/components/effect/ClickSparkManager";
import InventoryWindow from "client/ui/components/item/inventory/InventoryWindow";
import PurchaseWindow from "client/ui/components/item/shop/PurchaseWindow";
import ShopWindow from "client/ui/components/item/shop/ShopWindow";
import LogsWindow from "client/ui/components/logs/LogsWindow";
import DialogueWindow from "client/ui/components/npc/DialogueWindow";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import TrackedQuestWindow from "client/ui/components/quest/TrackedQuestWindow";
import RenameWindow from "client/ui/components/rename/RenameWindow";
import CopyWindow from "client/ui/components/settings/CopyWindow";
import SettingsManager from "client/ui/components/settings/SettingsManager";
import StatsWindow from "client/ui/components/stats/StatsWindow";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import WorldRenderer from "client/ui/components/world/WorldRenderer";
import { useVisibilityMain } from "client/ui/hooks/useVisibility";

export function Hamster() {
    useVisibilityMain(true);

    return <Fragment />;
}

@Controller()
export default class AppController implements OnStart {
    constructor(
        private readonly buildController: BuildController,
        private readonly inventoryController: InventoryController,
    ) {}

    onStart() {
        createRoot(MAIN_LAYOUT_GUI).render(<MainLayout />);
        createRoot(CLICK_SPARKS_GUI).render(<ClickSparkManager />);
        createRoot(TOOLTIPS_GUI).render(<TooltipWindow />);
        createRoot(DIALOGUE_GUI).render(<DialogueWindow />);
        createRoot(BALANCE_GUI).render(<BalanceWindow />);
        createRoot(BUILD_GUI).render(<BuildManager buildController={this.buildController} />);
        createRoot(SETTINGS_GUI).render(
            <Fragment>
                <CopyWindow />
                <SettingsManager />
                <CommandsWindow />
                <RenameWindow />
            </Fragment>,
        );
        createRoot(INVENTORY_GUI).render(<InventoryWindow inventoryController={this.inventoryController} />);
        createRoot(LOGS_GUI).render(<LogsWindow />);
        createRoot(QUESTS_GUI).render(
            <Fragment>
                <QuestWindow />
                <TrackedQuestWindow />
            </Fragment>,
        );
        createRoot(BACKPACK_GUI).render(<BackpackWindow />);
        createRoot(STATS_GUI).render(<StatsWindow />);
        createRoot(PURCHASE_GUI).render(<PurchaseWindow />);
        createRoot(SHOP_GUI).render(<ShopWindow />);
        createRoot(WORLD_GUI).render(<WorldRenderer />);

        task.wait(1);
        createRoot(HAMSTER_GUI).render(<Hamster />);
    }
}
