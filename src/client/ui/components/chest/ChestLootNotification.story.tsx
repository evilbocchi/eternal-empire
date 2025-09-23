/**
 * @fileoverview UI Labs story for ChestLootNotification component.
 * Provides interactive controls for testing chest loot animations with item previews.
 */

import React, { StrictMode, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import ChestLootNotification, { ChestLootData } from "./ChestLootNotification";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            includeXP: true,
            xpAmount: 5,
            includeGrass: true,
            grassAmount: 3,
            includeStone: true,
            stoneAmount: 2,
            includeGem: false,
            gemAmount: 1,
        },
    },
    (props) => {
        const [lootData, setLootData] = useState<ChestLootData>({
            loot: [],
            visible: false,
        });
        const viewportManagement = useCIViewportManagement({ enabled: true });

        const triggerLoot = () => {
            const loot: Array<{ id: string | "xp"; amount: number }> = [];

            if (props.controls.includeXP) {
                loot.push({ id: "xp", amount: props.controls.xpAmount });
            }
            if (props.controls.includeGrass) {
                loot.push({ id: "Grass", amount: props.controls.grassAmount });
            }
            if (props.controls.includeStone) {
                loot.push({ id: "ExcavationStone", amount: props.controls.stoneAmount });
            }
            if (props.controls.includeGem) {
                loot.push({ id: "WhiteGem", amount: props.controls.gemAmount });
            }

            setLootData({
                loot: loot,
                visible: true,
            });
        };

        const handleComplete = () => {
            setLootData((prev) => ({ ...prev, visible: false }));
            print("Chest loot notification finished!");
        };

        return (
            <StrictMode>
                <TooltipWindow />
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                    {/* Background for context */}
                    <frame
                        BackgroundColor3={Color3.fromRGB(40, 50, 40)}
                        BorderSizePixel={0}
                        Size={new UDim2(1, 0, 1, 0)}
                    >
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(60, 70, 60)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(30, 40, 30)),
                                ])
                            }
                            Rotation={45}
                        />
                    </frame>

                    <ChestLootNotification
                        data={lootData}
                        onComplete={handleComplete}
                        viewportManagement={viewportManagement}
                    />

                    {/* Trigger Button */}
                    <textbutton
                        BackgroundColor3={Color3.fromRGB(100, 150, 200)}
                        BorderSizePixel={0}
                        Position={new UDim2(0, 50, 0, 50)}
                        Size={new UDim2(0, 200, 0, 50)}
                        Text="📦 TRIGGER CHEST LOOT!"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        ZIndex={5}
                        Event={{
                            Activated: triggerLoot,
                        }}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <uistroke Color={Color3.fromRGB(150, 200, 255)} Thickness={2} />
                    </textbutton>

                    {/* Control Info Display */}
                    <frame
                        BackgroundColor3={Color3.fromRGB(40, 40, 50)}
                        BorderSizePixel={0}
                        Position={new UDim2(0, 50, 0, 120)}
                        Size={new UDim2(0, 300, 0, 200)}
                        ZIndex={5}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 5)}
                            Size={new UDim2(1, -20, 0, 25)}
                            Text={`XP: ${props.controls.includeXP ? `+${props.controls.xpAmount}` : "None"}`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 30)}
                            Size={new UDim2(1, -20, 0, 25)}
                            Text={`Grass: ${props.controls.includeGrass ? `x${props.controls.grassAmount}` : "None"}`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 55)}
                            Size={new UDim2(1, -20, 0, 25)}
                            Text={`Stone: ${props.controls.includeStone ? `x${props.controls.stoneAmount}` : "None"}`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 80)}
                            Size={new UDim2(1, -20, 0, 25)}
                            Text={`Gem: ${props.controls.includeGem ? `x${props.controls.gemAmount}` : "None"}`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        />
                        <textlabel
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 10, 0, 110)}
                            Size={new UDim2(1, -20, 0, 80)}
                            Text="Toggle the checkboxes to customize loot, then click the button to trigger the chest loot animation with 3D item previews!"
                            TextColor3={Color3.fromRGB(200, 200, 200)}
                            TextSize={12}
                            TextWrapped={true}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            TextYAlignment={Enum.TextYAlignment.Top}
                        />
                    </frame>

                    {/* Instructions */}
                    <textlabel
                        AnchorPoint={new Vector2(1, 0)}
                        BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                        BorderSizePixel={0}
                        Position={new UDim2(1, -10, 0, 10)}
                        Size={new UDim2(0, 300, 0, 120)}
                        Text={`Chest Loot Demo:

A more subdued notification for frequent chest openings. Features 3D viewport previews of items, organized loot display, and smooth animations.

Adjust the controls to test different loot combinations.`}
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
