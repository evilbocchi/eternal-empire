/**
 * @fileoverview UI Labs story for UpgradeBoard components.
 * Provides interactive controls for testing upgrade selection and purchase functionality.
 */

import React, { StrictMode, useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import UpgradeBoardRenderer from "client/ui/components/upgrade/UpgradeBoardRenderer";
import UpgradeBoardI from "shared/items/negative/trueease/UpgradeBoardI";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import { UpgradeActionsPanel } from "./UpgradeActionsPanel";
import { UpgradeOptionsPanel } from "./UpgradeOptionsPanel";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            moreFundsAmount: 15,
            morePowerAmount: 8,
            fasterTreadingAmount: 3,
            landReclaimationAmount: 0,
            enableSounds: false,
            visible: true,
        },
    },
    (props) => {
        const mockUpgradeAmounts = new Map([
            [NamedUpgrades.MoreFunds.id, props.controls.moreFundsAmount],
            [NamedUpgrades.MorePower.id, props.controls.morePowerAmount],
            [NamedUpgrades.FasterTreading.id, props.controls.fasterTreadingAmount],
            [NamedUpgrades.LandReclaimation.id, props.controls.landReclaimationAmount],
        ]);

        const [selectedUpgradeId, setSelectedUpgradeId] = useState<string>(NamedUpgrades.MoreFunds.id);
        const [upgradeAmounts, setUpgradeAmounts] = useState(mockUpgradeAmounts);
        const upgrades = new Array<NamedUpgrade>();
        for (const [id] of mockUpgradeAmounts) {
            const upgrade = NamedUpgrades.ALL_UPGRADES.get(id);
            if (upgrade) {
                upgrades.push(upgrade);
            }
        }

        let selectedUpgrade: NamedUpgrade | undefined;
        for (const [id, upgrade] of NamedUpgrades.ALL_UPGRADES) {
            if (id === selectedUpgradeId) {
                selectedUpgrade = upgrade;
                break;
            }
        }

        const upgradeAmount = upgradeAmounts.get(selectedUpgradeId!) ?? 0;
        const isMaxed = selectedUpgrade?.cap !== undefined && upgradeAmount >= selectedUpgrade.cap;

        const costs = {
            buy1: isMaxed ? "MAXED" : "1.25e12 Funds",
            buyNext: isMaxed ? "MAXED" : "5.78e12 Funds (to 20)",
            buyMax: isMaxed ? "MAXED" : "1.23e15 Funds",
        };

        const handleBuy = (purchaseType: string) => {
            if (!selectedUpgrade || isMaxed) return;

            const newAmounts = new Map<string, number>();
            for (const [key, value] of upgradeAmounts) {
                newAmounts.set(key, value);
            }

            let newAmount = upgradeAmount;

            if (purchaseType === "buy1") {
                newAmount = math.min(upgradeAmount + 1, selectedUpgrade.cap ?? math.huge);
            } else if (purchaseType === "buyNext") {
                newAmount = math.min(upgradeAmount + 10, selectedUpgrade.cap ?? math.huge);
            } else if (purchaseType === "buyMax") {
                newAmount = selectedUpgrade.cap ?? math.huge;
            }

            newAmounts.set(selectedUpgrade.id, newAmount);
            setUpgradeAmounts(newAmounts);

            if (props.controls.enableSounds) {
                print(`🔊 Purchase sound would play here`);
            }
            print(`Purchased ${purchaseType} for ${selectedUpgrade.name}, new amount: ${newAmount}`);
        };

        useEffect(() => {
            const testModel = UpgradeBoardI.MODEL?.Clone();
            if (!testModel) return;
            testModel.SetAttribute("ItemId", UpgradeBoardI.id);
            testModel.AddTag("UpgradeBoard");
            testModel.PivotTo(new CFrame(0, 10, 0));
            testModel.Parent = Workspace;
            return () => {
                testModel.Destroy();
            };
        }, []);

        return (
            <StrictMode>
                <UpgradeBoardRenderer />
                <frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} Visible={props.controls.visible}>
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                        Padding={new UDim(0, 20)}
                    />

                    {/* Options Panel */}
                    <frame Size={new UDim2(0, 400, 0, 300)} BackgroundColor3={Color3.fromRGB(40, 40, 40)}>
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <uistroke Color={Color3.fromRGB(80, 80, 80)} Thickness={2} />

                        <textlabel
                            Size={new UDim2(1, 0, 0, 40)}
                            BackgroundTransparency={1}
                            Text="Upgrade Options"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled={true}
                            Font={Enum.Font.GothamBold}
                            TextXAlignment={Enum.TextXAlignment.Center}
                        />

                        <frame
                            Position={new UDim2(0, 0, 0, 40)}
                            Size={new UDim2(1, 0, 1, -40)}
                            BackgroundTransparency={1}
                        >
                            <UpgradeOptionsPanel
                                upgrades={upgrades}
                                upgradeAmounts={upgradeAmounts}
                                selectedUpgradeId={selectedUpgradeId}
                                onSelectUpgrade={setSelectedUpgradeId}
                            />
                        </frame>
                    </frame>

                    {/* Actions Panel */}
                    <frame Size={new UDim2(0, 600, 0, 500)} BackgroundColor3={Color3.fromRGB(40, 40, 40)}>
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <uistroke Color={Color3.fromRGB(80, 80, 80)} Thickness={2} />

                        <textlabel
                            Size={new UDim2(1, 0, 0, 40)}
                            BackgroundTransparency={1}
                            Text="Upgrade Actions"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled={true}
                            Font={Enum.Font.GothamBold}
                            TextXAlignment={Enum.TextXAlignment.Center}
                        />

                        <frame
                            Position={new UDim2(0, 0, 0, 40)}
                            Size={new UDim2(1, 0, 1, -40)}
                            BackgroundTransparency={1}
                        >
                            <UpgradeActionsPanel
                                selectedUpgrade={selectedUpgrade}
                                upgradeAmount={upgradeAmount}
                                costs={costs}
                                isMaxed={isMaxed}
                                onBuy1={() => handleBuy("buy1")}
                                onBuyNext={() => handleBuy("buyNext")}
                                onBuyMax={() => handleBuy("buyMax")}
                            />
                        </frame>
                    </frame>

                    {/* Instructions */}
                    <textlabel
                        AnchorPoint={new Vector2(1, 0)}
                        BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                        BorderSizePixel={0}
                        Position={new UDim2(1, -10, 0, 10)}
                        Size={new UDim2(0, 300, 0, 150)}
                        Text={`Upgrade Board Demo:

React-based upgrade system with clean component architecture. Select upgrades from the options panel, view details and purchase with different quantities.

Adjust the control sliders to test different upgrade amounts.`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        TextYAlignment={Enum.TextYAlignment.Top}
                        ZIndex={10}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <uipadding
                            PaddingBottom={new UDim(0, 8)}
                            PaddingLeft={new UDim(0, 8)}
                            PaddingRight={new UDim(0, 8)}
                            PaddingTop={new UDim(0, 8)}
                        />
                    </textlabel>
                </frame>
            </StrictMode>
        );
    },
);
