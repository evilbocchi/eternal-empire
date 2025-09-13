import { Controller, OnStart } from "@flamework/core";
import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import {
    BACKPACK_GUI,
    BALANCE_GUI,
    BUILD_GUI,
    CLICK_SPARKS_GUI,
    INVENTORY_GUI,
    LOGS_GUI,
    MAIN_LAYOUT_GUI,
    QUESTS_GUI,
    SETTINGS_GUI,
    STATS_GUI,
    TOOLTIPS_GUI,
} from "client/controllers/core/ScreenGuis";
import BuildController from "client/controllers/gameplay/BuildController";
import ToolController from "client/controllers/gameplay/ToolController";
import InventoryController from "client/controllers/interface/InventoryController";
import MainLayout from "client/ui/components/MainLayout";
import BackpackManager from "client/ui/components/backpack/BackpackManager";
import BalanceWindow from "client/ui/components/balance/BalanceWindow";
import BuildManager from "client/ui/components/build/BuildManager";
import CommandsWindow from "client/ui/components/commands/CommandsWindow";
import ClickSparkManager from "client/ui/components/effect/ClickSparkManager";
import InventoryWindow from "client/ui/components/inventory/InventoryWindow";
import LogsWindow from "client/ui/components/logs/LogsWindow";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import RenameWindow from "client/ui/components/rename/RenameWindow";
import CopyWindow from "client/ui/components/settings/CopyWindow";
import SettingsManager from "client/ui/components/settings/SettingsManager";
import StatsWindow from "client/ui/components/stats/StatsWindow";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";

@Controller()
export default class AppController implements OnStart {
    constructor(
        private readonly buildController: BuildController,
        private readonly inventoryController: InventoryController,
        private readonly toolController: ToolController,
    ) {}

    onStart() {
        ReactRoblox.createRoot(MAIN_LAYOUT_GUI).render(<MainLayout />);
        ReactRoblox.createRoot(CLICK_SPARKS_GUI).render(<ClickSparkManager />);
        ReactRoblox.createRoot(TOOLTIPS_GUI).render(<TooltipWindow />);
        ReactRoblox.createRoot(BALANCE_GUI).render(<BalanceWindow />);
        ReactRoblox.createRoot(BUILD_GUI).render(<BuildManager buildController={this.buildController} />);
        ReactRoblox.createRoot(SETTINGS_GUI).render(
            <Fragment>
                <CopyWindow />
                <SettingsManager />
                <CommandsWindow />
                <RenameWindow />
            </Fragment>,
        );
        ReactRoblox.createRoot(INVENTORY_GUI).render(
            <InventoryWindow inventoryController={this.inventoryController} />,
        );
        ReactRoblox.createRoot(LOGS_GUI).render(<LogsWindow />);
        ReactRoblox.createRoot(QUESTS_GUI).render(<QuestWindow />);
        ReactRoblox.createRoot(BACKPACK_GUI).render(<BackpackManager toolController={this.toolController} />);
        ReactRoblox.createRoot(STATS_GUI).render(<StatsWindow />);
    }
}
