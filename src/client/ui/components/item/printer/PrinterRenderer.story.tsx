/**
 * @fileoverview UI Labs story for UpgradeBoard components.
 * Provides interactive controls for testing upgrade selection and purchase functionality.
 */

import { OnoeNum } from "@antivivi/serikanum";
import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import PrinterRenderer from "client/ui/components/item/printer/PrinterRenderer";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        useEffect(() => {
            Packets.printedSetups.set([
                {
                    name: "Basic Setup",
                    area: "BarrenIslands",
                    autoloads: false,
                    calculatedPrice: new Map([["Funds", new OnoeNum(5000)]]),
                    items: [],
                    alerted: false,
                },
            ]);
        }, []);

        useEffect(() => {
            const testModels = new Array<Instance>();

            const createTestModel = (item: Item) => {
                const testModel = item.MODEL?.Clone();
                if (!testModel) return;
                testModel.SetAttribute("ItemId", item.id);
                testModel.AddTag("Printer");
                testModel.PivotTo(new CFrame(-testModels.size() * 50, 30, 0));
                testModel.Parent = Workspace;
                testModels.push(testModel);
            };
            for (const printer of Items.sortedItems) {
                if (printer.findTrait("Printer")) {
                    createTestModel(printer);
                }
            }

            return () => {
                testModels.forEach((model) => model.Destroy());
            };
        }, []);

        return <PrinterRenderer />;
    },
);
