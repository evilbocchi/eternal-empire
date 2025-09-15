/**
 * @fileoverview Main backpack window React component
 *
 * Displays the player's tool inventory with hotkey numbers and selection states.
 * Manages visibility based on adaptive tab and build mode states.
 */

import React, { useCallback, useEffect, useState } from "@rbxts/react";
import { Environment } from "@rbxts/ui-labs";
import { LOCAL_PLAYER } from "client/constants";
import ToolOption, { layoutOrderFromTool } from "client/ui/components/backpack/ToolOption";
import { useWindow } from "client/ui/components/window/WindowManager";
import { playSound } from "shared/asset/GameAssets";
import HarvestingTool from "shared/item/traits/HarvestingTool";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

const KEY_CODES = new Map<number, Enum.KeyCode>([
    [1, Enum.KeyCode.One],
    [2, Enum.KeyCode.Two],
    [3, Enum.KeyCode.Three],
    [4, Enum.KeyCode.Four],
    [5, Enum.KeyCode.Five],
    [6, Enum.KeyCode.Six],
    [7, Enum.KeyCode.Seven],
    [8, Enum.KeyCode.Eight],
    [9, Enum.KeyCode.Nine],
    [10, Enum.KeyCode.Zero],
]);

/**
 * Main backpack window component that displays tool options
 */
export default function BackpackWindow() {
    const [visible, setVisible] = useState(true);
    const [harvestingTools, setHarvestingTools] = useState<Set<HarvestingTool>>(new Set());
    const [equippedTool, setEquippedTool] = useState<HarvestingTool | undefined>(undefined);

    useWindow({
        id: "Backpack",
        visible,
        onOpen: () => {
            setVisible(true);
        },
        onClose: () => {
            setVisible(false);
        },
    });

    useEffect(() => {
        const onCharacterAdded = (character: Model) => {
            const onToolAdded = (tool: Instance) => {
                if (tool.IsA("Tool")) {
                    const item = Items.itemsPerId.get(tool.Name);
                    if (item) {
                        const harvestingTool = item.findTrait("HarvestingTool");
                        setEquippedTool(harvestingTool);
                    }
                }
            };

            const onToolRemoved = (tool: Instance) => {
                if (tool.IsA("Tool")) {
                    setEquippedTool(undefined);
                }
            };
            character.ChildAdded.Connect(onToolAdded);
            character.ChildRemoved.Connect(onToolRemoved);
            const existingTool = character.FindFirstChildOfClass("Tool");
            if (existingTool) {
                onToolAdded(existingTool);
            }
        };

        const connection = LOCAL_PLAYER.CharacterAdded.Connect(onCharacterAdded);
        if (LOCAL_PLAYER.Character) {
            onCharacterAdded(LOCAL_PLAYER.Character);
        }

        return () => {
            connection.Disconnect();
        };
    }, []);

    const equipHarvestableTool = useCallback((harvestingTool: HarvestingTool) => {
        const backpack = LOCAL_PLAYER.FindFirstChildOfClass("Backpack");

        const currentlyEquippedTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
        if (currentlyEquippedTool) {
            currentlyEquippedTool.Parent = backpack;
            if (currentlyEquippedTool.Name === harvestingTool.item.id) {
                setEquippedTool(undefined);
                playSound("Unequip.mp3");
                return;
            }
        }

        const tool = backpack?.FindFirstChild(harvestingTool.item.id) as Tool | undefined;
        if (tool === undefined) return;
        tool.Parent = LOCAL_PLAYER.Character;
        setEquippedTool(harvestingTool);
        playSound("Equip.mp3");
    }, []);

    useEffect(() => {
        const connection = Environment.UserInput.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true) return;

            let index = -1;
            for (const [i, v] of KEY_CODES) {
                if (input.KeyCode === v) {
                    index = i;
                    break;
                }
            }

            let sortedTools = new Array<HarvestingTool>();
            for (const tool of harvestingTools) {
                sortedTools.push(tool);
            }
            sortedTools = sortedTools.sort((a, b) => layoutOrderFromTool(a) < layoutOrderFromTool(b));
            const equipping = sortedTools[index - 1];
            if (equipping === undefined) return;
            print("Equipping tool via hotkey:", equipping.item.name);
            equipHarvestableTool(equipping);
        });

        return () => connection.Disconnect();
    }, []);

    useEffect(() => {
        const connection = Packets.inventory.observe((inventory) => {
            const [bestTools] = HarvestingTool.getBestToolsFromInventory(inventory, Items.itemsPerId);
            setHarvestingTools(bestTools);
        });
        return () => connection.Disconnect();
    }, []);

    const toolOptions = new Array<JSX.Element>();
    for (const harvestingTool of harvestingTools) {
        toolOptions.push(
            <ToolOption
                harvestingTool={harvestingTool}
                isEquipped={equippedTool === harvestingTool}
                onClick={() => equipHarvestableTool(harvestingTool)}
            />,
        );
    }

    return (
        <frame
            key="BackpackWindow"
            AnchorPoint={new Vector2(0.5, 1)}
            BackgroundTransparency={1}
            Position={new UDim2(0.5, 0, 0.985, -5)}
            Size={new UDim2(0.45, 200, 0.025, 30)}
            Visible={visible}
            ZIndex={0}
        >
            {/* Tool options */}
            {toolOptions}

            {/* Layout */}
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
        </frame>
    );
}
