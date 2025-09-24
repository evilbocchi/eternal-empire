/**
 * @fileoverview UI Labs story for UpgradeBoard components.
 * Provides interactive controls for testing upgrade selection and purchase functionality.
 */

import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import UpgradeBoardRenderer from "client/ui/components/world/upgrade/UpgradeBoardRenderer";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        useEffect(() => {
            const mockUpgradeAmounts = new Map<string, number>();
            for (const [id, upgrade] of NamedUpgrades.ALL_UPGRADES) {
                mockUpgradeAmounts.set(id, math.random(0, (upgrade.cap ?? 10) - 1));
            }

            Packets.upgrades.set(mockUpgradeAmounts);
        }, []);

        useEffect(() => {
            Packets.buyUpgrade.fromClient((_, upgradeId, to) => {
                if (!to) return false;
                print(`Bought ${upgradeId} up to ${to}`);
                const upgrades = Packets.upgrades.get();
                if (upgrades) {
                    upgrades.set(upgradeId, to);
                    Packets.upgrades.set(table.clone(upgrades));
                }
                return true;
            });
        }, []);

        useEffect(() => {
            const testModels = new Array<Instance>();

            const createTestModel = (item: Item) => {
                const testModel = item.MODEL?.Clone();
                if (!testModel) return;
                testModel.SetAttribute("ItemId", item.id);
                testModel.AddTag("UpgradeBoard");
                testModel.PivotTo(new CFrame(-testModels.size() * 50, 30, 0));
                testModel.Parent = Workspace;
                testModels.push(testModel);
            };
            for (const upgradeBoard of Items.sortedItems) {
                if (upgradeBoard.findTrait("UpgradeBoard")) {
                    createTestModel(upgradeBoard);
                }
            }

            return () => {
                testModels.forEach((model) => model.Destroy());
            };
        }, []);

        return (
            <StrictMode>
                <UpgradeBoardRenderer />
            </StrictMode>
        );
    },
);
