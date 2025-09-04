import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { PLAYER_GUI } from "client/constants";
import BuildController from "client/controllers/gameplay/BuildController";
import ToolController from "client/controllers/gameplay/ToolController";
import InventoryController from "client/controllers/interface/InventoryController";
import App from "client/ui/components/App";
import BuildManager from "client/ui/components/build/BuildManager";
import ClickSparkManager from "client/ui/components/effect/ClickSparkManager";
import { TooltipDisplay } from "client/ui/components/tooltip/TooltipManager";

const createScreenGui = (name: string): ScreenGui => {
    const screenGui = new Instance("ScreenGui");
    screenGui.IgnoreGuiInset = true;
    screenGui.ResetOnSpawn = false;
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
    screenGui.Name = name;
    screenGui.Parent = PLAYER_GUI;
    return screenGui;
};

const APP_GUI = createScreenGui("App");
const CLICK_SPARKS_GUI = createScreenGui("ClickSparks");
const TOOLTIPS_GUI = createScreenGui("Tooltips");
const BUILD_MANAGER_GUI = createScreenGui("BuildManager");

@Controller()
export default class AppController implements OnStart {
    constructor(
        private readonly buildController: BuildController,
        private readonly inventoryController: InventoryController,
        private readonly toolController: ToolController,
    ) {}

    onStart() {
        ReactRoblox.createRoot(TOOLTIPS_GUI).render(<TooltipDisplay />);
        ReactRoblox.createRoot(APP_GUI).render(
            <App inventoryController={this.inventoryController} toolController={this.toolController} />,
        );
        ReactRoblox.createRoot(CLICK_SPARKS_GUI).render(<ClickSparkManager />);
        ReactRoblox.createRoot(BUILD_MANAGER_GUI).render(<BuildManager buildController={this.buildController} />);
    }
}
