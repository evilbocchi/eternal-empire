import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { PLAYER_GUI } from "client/constants";
import BuildController from "client/controllers/gameplay/BuildController";
import ToolController from "client/controllers/gameplay/ToolController";
import InventoryController from "client/controllers/interface/InventoryController";
import MainLayout from "client/ui/components/MainLayout";
import BackpackManager from "client/ui/components/backpack/BackpackManager";
import BuildManager from "client/ui/components/build/BuildManager";
import ClickSparkManager from "client/ui/components/effect/ClickSparkManager";
import InventoryWindow from "client/ui/components/inventory/InventoryWindow";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import SettingsManager from "client/ui/components/settings/SettingsManager";
import { TooltipDisplay } from "client/ui/components/tooltip/TooltipManager";

const createScreenGui = (name: string, displayOrder = 0): ScreenGui => {
    const screenGui = new Instance("ScreenGui");
    screenGui.IgnoreGuiInset = true;
    screenGui.ResetOnSpawn = false;
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
    screenGui.Name = name;
    screenGui.DisplayOrder = displayOrder;
    screenGui.Parent = PLAYER_GUI;
    return screenGui;
};

const MAIN_LAYOUT_GUI = createScreenGui("MainLayout");
const CLICK_SPARKS_GUI = createScreenGui("ClickSparks", 1);
const TOOLTIPS_GUI = createScreenGui("Tooltips", 2);
const BUILD_GUI = createScreenGui("BuildManager");
const SETTINGS_GUI = createScreenGui("Settings");
const INVENTORY_GUI = createScreenGui("Inventory");
const QUESTS_GUI = createScreenGui("Quests");
const BACKPACK_GUI = createScreenGui("Backpack");

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
        ReactRoblox.createRoot(TOOLTIPS_GUI).render(<TooltipDisplay />);
        ReactRoblox.createRoot(BUILD_GUI).render(<BuildManager buildController={this.buildController} />);
        ReactRoblox.createRoot(SETTINGS_GUI).render(<SettingsManager />);
        ReactRoblox.createRoot(INVENTORY_GUI).render(
            <InventoryWindow inventoryController={this.inventoryController} />,
        );
        ReactRoblox.createRoot(QUESTS_GUI).render(<QuestWindow />);
        ReactRoblox.createRoot(BACKPACK_GUI).render(<BackpackManager toolController={this.toolController} />);
    }
}
