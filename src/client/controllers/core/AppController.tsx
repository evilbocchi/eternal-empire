import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { PLAYER_GUI } from "client/constants";
import BuildController from "client/controllers/gameplay/BuildController";
import ToolController from "client/controllers/gameplay/ToolController";
import InventoryController from "client/controllers/interface/InventoryController";
import App from "shared/ui/components/App";
import ClickSparkManager from "shared/ui/components/effect/ClickSparkManager";

const APP_GUI = new Instance("ScreenGui");
APP_GUI.IgnoreGuiInset = true;
APP_GUI.ResetOnSpawn = false;
APP_GUI.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
APP_GUI.Name = "App";
APP_GUI.Parent = PLAYER_GUI;

const CLICK_SPARKS = new Instance("ScreenGui");
CLICK_SPARKS.IgnoreGuiInset = true;
CLICK_SPARKS.ResetOnSpawn = false;
CLICK_SPARKS.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
CLICK_SPARKS.Name = "ClickSparks";
CLICK_SPARKS.Parent = PLAYER_GUI;

@Controller()
export default class AppController implements OnStart {
    constructor(
        private readonly buildController: BuildController,
        private readonly inventoryController: InventoryController,
        private readonly toolController: ToolController,
    ) {}

    onStart() {
        ReactRoblox.createRoot(APP_GUI).render(
            <App
                buildController={this.buildController}
                inventoryController={this.inventoryController}
                toolController={this.toolController}
            />,
        );
        ReactRoblox.createRoot(CLICK_SPARKS).render(<ClickSparkManager />);
    }
}
