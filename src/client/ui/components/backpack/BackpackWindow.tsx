/**
 * @fileoverview Main backpack window React component
 *
 * Displays the player's tool inventory with hotkey numbers and selection states.
 * Manages visibility based on adaptive tab and build mode states.
 */

import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Environment } from "@rbxts/ui-labs";
import { LOCAL_PLAYER } from "client/constants";
import GearOption, { layoutOrderFromGear } from "client/ui/components/backpack/GearOption";
import { useDocument } from "client/ui/components/window/WindowManager";
import { playSound } from "shared/asset/GameAssets";
import { IS_CI } from "shared/Context";
import Gear from "shared/item/traits/Gear";
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

const equipGear = (itemId: string) => {
    const backpack = LOCAL_PLAYER.FindFirstChildOfClass("Backpack");

    const currentlyEquippedTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
    if (currentlyEquippedTool) {
        currentlyEquippedTool.Parent = backpack;
        if (currentlyEquippedTool.Name === itemId) {
            playSound("Unequip.mp3");
            return false;
        }
    }
    let tool: Tool | undefined;
    if (IS_CI) {
        tool = Items.getItem(itemId)?.MODEL?.Clone() as Tool | undefined;
    } else {
        tool = backpack?.FindFirstChild(itemId) as Tool | undefined;
    }

    if (tool === undefined) return false;
    tool.Parent = LOCAL_PLAYER.Character;
    playSound("Equip.mp3");
    return true;
};

/**
 * Main backpack window component that displays tool options
 */
export default function BackpackWindow() {
    const ref = useRef<Frame>();
    const [gears, setGears] = useState<Set<Gear>>(new Set());
    const [equippedGear, setEquippedGear] = useState<Gear | undefined>(undefined);
    const { visible } = useDocument({ id: "Backpack", priority: -1 });
    const openPosition = new UDim2(0.5, 0, 0.985, -5);
    const closedPosition = new UDim2(0.5, 0, 1.2, 0);
    useEffect(() => {
        if (visible) {
            ref.current?.TweenPosition(openPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 1, true);
        } else {
            ref.current?.TweenPosition(closedPosition, Enum.EasingDirection.In, Enum.EasingStyle.Quad, 1, true);
        }
    }, [visible]);

    useEffect(() => {
        const onCharacterAdded = (character: Model) => {
            const onToolAdded = (tool: Instance) => {
                if (tool.IsA("Tool")) {
                    const item = Items.itemsPerId.get(tool.Name);
                    if (item) {
                        const gear = item.findTrait("Gear");
                        setEquippedGear(gear);
                    }
                }
            };

            const onToolRemoved = (tool: Instance) => {
                if (tool.IsA("Tool")) {
                    setEquippedGear(undefined);
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

            let sortedGears = new Array<Gear>();
            for (const tool of gears) {
                sortedGears.push(tool);
            }
            sortedGears = sortedGears.sort((a, b) => layoutOrderFromGear(a) < layoutOrderFromGear(b));
            const equipping = sortedGears[index - 1];
            if (equipping === undefined) return;
            print("Equipping gear via hotkey:", equipping.item.name); // TODO this does not work for some reason
            equipGear(equipping.item.id);
        });

        return () => connection.Disconnect();
    }, []);

    useEffect(() => {
        const connection = Packets.inventory.observe((inventory) => {
            const [bestTools] = Gear.getBestGearsFromInventory(inventory, Items.itemsPerId);
            setGears(bestTools);
        });
        return () => connection.Disconnect();
    }, []);

    const gearOptions = new Array<JSX.Element>();
    for (const gear of gears) {
        gearOptions.push(
            <GearOption gear={gear} isEquipped={equippedGear === gear} onClick={() => equipGear(gear.item.id)} />,
        );
    }

    return (
        <frame
            ref={ref}
            AnchorPoint={new Vector2(0.5, 1)}
            BackgroundTransparency={1}
            Position={closedPosition}
            Size={new UDim2(0.45, 200, 0.03, 20)}
            ZIndex={-3}
        >
            {/* Gear options */}
            {gearOptions}

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
