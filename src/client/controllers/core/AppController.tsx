import { Controller, OnInit } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { PLAYER_GUI } from "client/constants";
import BuildController from "client/controllers/gameplay/BuildController";
import InventoryController from "client/controllers/interface/InventoryController";
import App from "shared/ui/components/App";

const APP_GUI = new Instance("ScreenGui");
APP_GUI.IgnoreGuiInset = true;
APP_GUI.ResetOnSpawn = false;
APP_GUI.Name = "App";
APP_GUI.Parent = PLAYER_GUI;

@Controller()
export default class AppController implements OnInit {

    constructor(
        private readonly buildController: BuildController,
        private readonly inventoryController: InventoryController
    ) { }

    onInit() {
        const root = ReactRoblox.createRoot(APP_GUI);
        root.render(<App buildController={this.buildController} inventoryController={this.inventoryController} />);
    }
}