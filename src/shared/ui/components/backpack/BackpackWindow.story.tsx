/**
 * @fileoverview Storybook stories for BackpackWindow component
 * 
 * Demonstrates the BackpackWindow component with various tool configurations.
 */

import React from "@rbxts/react";
import BackpackWindow, { BackpackWindowState, BackpackWindowCallbacks } from "shared/ui/components/backpack/BackpackWindow";
import { ToolOptionData } from "shared/ui/components/backpack/ToolOption";

// Mock tool instances for testing
const createMockTool = (name: string, textureId: string): Tool => ({
    Name: name,
    TextureId: textureId,
    Parent: undefined,
} as Tool);

const mockTools: ToolOptionData[] = [
    {
        tool: createMockTool("Wooden Pickaxe", "rbxassetid://123456789"),
        name: "Wooden Pickaxe",
        textureId: "rbxassetid://123456789",
        hotkeyNumber: 1,
        isEquipped: false,
        layoutOrder: 1
    },
    {
        tool: createMockTool("Stone Axe", "rbxassetid://987654321"),
        name: "Stone Axe", 
        textureId: "rbxassetid://987654321",
        hotkeyNumber: 2,
        isEquipped: true,
        layoutOrder: 2
    },
    {
        tool: createMockTool("Iron Scythe", "rbxassetid://456789123"),
        name: "Iron Scythe",
        textureId: "rbxassetid://456789123", 
        hotkeyNumber: 3,
        isEquipped: false,
        layoutOrder: 3
    }
];

export = {
    summary: "BackpackWindow component for displaying player tools",
    stories: {
        "Empty Backpack": () => {
            const state: BackpackWindowState = {
                visible: true,
                tools: []
            };

            const callbacks: BackpackWindowCallbacks = {
                onToolClick: (tool) => print(`Clicked tool: ${tool.Name}`)
            };

            return <BackpackWindow state={state} callbacks={callbacks} />;
        },

        "With Tools": () => {
            const state: BackpackWindowState = {
                visible: true,
                tools: mockTools
            };

            const callbacks: BackpackWindowCallbacks = {
                onToolClick: (tool) => print(`Clicked tool: ${tool.Name}`)
            };

            return <BackpackWindow state={state} callbacks={callbacks} />;
        },

        "Hidden Backpack": () => {
            const state: BackpackWindowState = {
                visible: false,
                tools: mockTools
            };

            const callbacks: BackpackWindowCallbacks = {
                onToolClick: (tool) => print(`Clicked tool: ${tool.Name}`)
            };

            return <BackpackWindow state={state} callbacks={callbacks} />;
        }
    }
};