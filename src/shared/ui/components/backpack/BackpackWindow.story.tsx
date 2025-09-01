import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import BackpackWindow from "shared/ui/components/backpack/BackpackWindow";
import { ToolOptionData } from "shared/ui/components/backpack/ToolOption";

// Mock tool instances for testing
const createMockTool = (name: string, textureId: string): Tool => ({
    Name: name,
    TextureId: textureId,
    Parent: undefined,
} as Tool);

const controls = {
    visible: true,
    hasTools: true,
    animationsEnabled: true
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        const mockTools: ToolOptionData[] = props.controls.hasTools ? [
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
        ] : [];

        const state = {
            visible: props.controls.visible,
            tools: mockTools
        };

        const callbacks = {
            onToolClick: (tool: Tool) => print(`Clicked tool: ${tool.Name}`)
        };

        return <BackpackWindow state={state} callbacks={callbacks} animationsEnabled={props.controls.animationsEnabled} />;
    },
};