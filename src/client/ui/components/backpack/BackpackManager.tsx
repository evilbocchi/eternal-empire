/**
 * @fileoverview Backpack system manager component
 *
 * High-level manager that bridges tool controller logic with the new React UI.
 * Manages state synchronization and provides callbacks for tool operations.
 */

import React, { useCallback, useEffect, useState } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import type ToolController from "client/controllers/gameplay/ToolController";
import { playSound } from "shared/asset/GameAssets";
import { LOCAL_PLAYER } from "client/constants";
import Items from "shared/items/Items";
import BackpackWindow, {
    BackpackWindowCallbacks,
    BackpackWindowState,
} from "client/ui/components/backpack/BackpackWindow";
import { ToolOptionData } from "client/ui/components/backpack/ToolOption";

interface BackpackManagerProps {
    /** Interface to the tool controller */
    toolController?: ToolController;
    /** Whether animations are enabled */
    animationsEnabled?: boolean;
}

/**
 * High-level backpack manager component that handles UI state and coordinates with tool logic.
 * This component should be integrated into your main UI controller.
 */
export default function BackpackManager({ toolController, animationsEnabled = true }: BackpackManagerProps) {
    const [backpackState, setBackpackState] = useState<BackpackWindowState>({
        visible: false,
        tools: [],
    });

    // Update tool data from controller and visibility
    const updateState = useCallback(() => {
        if (!toolController) {
            setBackpackState({ visible: false, tools: [] });
            return;
        }

        const tools: ToolOptionData[] = [];
        const character = LOCAL_PLAYER.Character;
        const backpack = LOCAL_PLAYER.FindFirstChildOfClass("Backpack");

        if (!character || !backpack) {
            setBackpackState({ visible: false, tools: [] });
            return;
        }

        // Get currently equipped tool
        const equippedTool = character.FindFirstChildOfClass("Tool");

        // Process tools from controller's tools map
        const toolsMap = toolController.tools;
        let hotkeyIndex = 1;

        const toolOptions = new Array<[Tool, ToolOption]>();
        for (const [tool, option] of toolsMap) {
            toolOptions.push([tool, option]);
        }
        const sortedToolOptions = toolOptions.sort(([_a, optionA], [_b, optionB]) => {
            const layoutA = optionA.LayoutOrder;
            const layoutB = optionB.LayoutOrder;
            return layoutA < layoutB;
        });

        for (const [tool, _option] of sortedToolOptions) {
            const item = Items.getItem(tool.Name);
            if (!item) continue;

            const harvestingTool = item.findTrait("HarvestingTool");
            if (!harvestingTool) continue;

            // Determine layout order based on tool type
            let layoutOrder: number;
            switch (harvestingTool.toolType) {
                case "Pickaxe":
                    layoutOrder = 1;
                    break;
                case "Axe":
                    layoutOrder = 2;
                    break;
                case "Scythe":
                    layoutOrder = 3;
                    break;
                case "Rod":
                    layoutOrder = 4;
                    break;
                case "None":
                default:
                    layoutOrder = item.layoutOrder;
                    break;
            }

            const toolData: ToolOptionData = {
                tool,
                name: tool.Name,
                textureId: tool.TextureId,
                hotkeyNumber: hotkeyIndex,
                isEquipped: tool === equippedTool,
                layoutOrder,
            };

            tools.push(toolData);
            hotkeyIndex++;

            // Limit to 10 tools (0-9 keys)
            if (hotkeyIndex > 10) break;
        }

        const isVisible = tools.size() > 0;
        setBackpackState({
            visible: isVisible,
            tools,
        });
    }, [toolController]);

    // Set up continuous state updates
    useEffect(() => {
        if (!toolController) return;

        // Use RunService to continuously update state (matches original implementation)
        const connection = RunService.BindToRenderStep("BackpackManager", Enum.RenderPriority.Last.Value, updateState);

        return () => {
            RunService.UnbindFromRenderStep("BackpackManager");
        };
    }, [updateState]);

    // Callback handlers that delegate to existing tool logic
    const callbacks: BackpackWindowCallbacks = {
        onToolClick: useCallback((tool: Tool) => {
            // Replicate the existing tool equip/unequip logic from ToolController
            const backpack = LOCAL_PLAYER.FindFirstChildOfClass("Backpack");
            if (!backpack) return;

            playSound("Equip.mp3");
            if (tool.Parent === backpack) {
                // Equip tool
                const currentTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
                if (currentTool !== undefined) {
                    currentTool.Parent = backpack;
                }
                tool.Parent = LOCAL_PLAYER.Character;
            } else {
                // Unequip tool
                tool.Parent = backpack;
            }
        }, []),
    };

    return <BackpackWindow state={backpackState} callbacks={callbacks} animationsEnabled={animationsEnabled} />;
}
