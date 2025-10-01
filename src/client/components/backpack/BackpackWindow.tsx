/**
 * @fileoverview Main backpack window React component
 *
 * Displays the player's tool inventory with hotkey numbers and selection states.
 * Manages visibility based on adaptive tab and build mode states.
 */

import { loadAnimation } from "@antivivi/vrldk";
import React, { useEffect, useRef, useState } from "@rbxts/react";
import { StarterGui, Workspace } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import GearOption, { layoutOrderFromGear } from "client/components/backpack/GearOption";
import { useDocument } from "client/components/window/DocumentManager";
import { LOCAL_PLAYER, observeCharacter } from "client/constants";
import { playSound } from "shared/asset/GameAssets";
import { IS_EDIT } from "shared/Context";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
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
    const backpack = LOCAL_PLAYER?.FindFirstChildOfClass("Backpack");
    const character = getPlayerCharacter();
    const humanoid = character?.FindFirstChildOfClass("Humanoid");
    if (character === undefined || humanoid === undefined) return false;

    const currentlyEquippedTool = character?.FindFirstChildOfClass("Tool");
    if (currentlyEquippedTool) {
        humanoid.UnequipTools();
        if (currentlyEquippedTool.Name === itemId) {
            playSound("Unequip.mp3");
            return false;
        }
    }
    let tool: Tool | undefined;
    if (IS_EDIT) {
        tool = Items.getItem(itemId)?.MODEL?.Clone() as Tool | undefined;
    } else {
        tool = backpack?.FindFirstChild(itemId) as Tool | undefined;
    }

    if (tool === undefined) return false;
    humanoid.EquipTool(tool);
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
        let swingAnimation: AnimationTrack | undefined;
        let childAddedConnection: RBXScriptConnection | undefined;
        let childRemovedConnection: RBXScriptConnection | undefined;

        const cleanup = observeCharacter((character: Model) => {
            print(character);
            const humanoid = character.WaitForChild("Humanoid") as Humanoid;
            swingAnimation = loadAnimation(humanoid, 16920778613);

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
            childAddedConnection?.Disconnect();
            childRemovedConnection?.Disconnect();
            childAddedConnection = character.ChildAdded.Connect(onToolAdded);
            childRemovedConnection = character.ChildRemoved.Connect(onToolRemoved);
            const existingTool = character.FindFirstChildOfClass("Tool");
            if (existingTool) {
                onToolAdded(existingTool);
            }
        });

        const OVERLAP_PARAMS = new OverlapParams();
        OVERLAP_PARAMS.CollisionGroup = "ItemHitbox";
        /**
         * Checks for a harvestable object in range of the tool.
         * @param tool The tool model to check from.
         * @returns The harvestable model or part, if found.
         */
        const checkHarvestable = (tool: Model) => {
            const blade = (tool.FindFirstChild("Blade") as BasePart | undefined) ?? tool.PrimaryPart;
            if (blade === undefined) return undefined;

            const inside = Workspace.GetPartBoundsInBox(
                blade.CFrame,
                blade.Size.add(new Vector3(1, 5, 1)),
                OVERLAP_PARAMS,
            );
            for (const touching of inside) {
                const tParent = touching.Parent;
                if (tParent === undefined) continue;
                if (tParent.IsA("Model")) {
                    if (tParent.Parent?.Name === "Harvestable") return tParent;
                } else if (tParent.Name === "Harvestable") return touching;
            }
        };

        StarterGui.SetCoreGuiEnabled("Backpack", false);
        let lastUse = 0;
        const inputBeganConnection = Environment.UserInput.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true) return;

            if (
                input.UserInputType === Enum.UserInputType.MouseButton1 ||
                input.UserInputType === Enum.UserInputType.Touch ||
                input.KeyCode === Enum.KeyCode.ButtonL1
            ) {
                const currentTool = getPlayerCharacter()?.FindFirstChildOfClass("Tool");
                if (currentTool === undefined) return;

                const item = Items.getItem(currentTool.Name);
                if (item === undefined) return;
                const gear = item.findTrait("Gear");
                if (gear === undefined || gear.type === "None") return;

                const t = tick();
                if (lastUse + 8 / (gear.speed ?? 1) > t) return;
                lastUse = t;
                const registerHit = () => {
                    const hit = checkHarvestable(currentTool);
                    if (hit === undefined) return;
                    Packets.useTool.toServer(hit);
                };
                if (IS_EDIT) {
                    registerHit();
                } else if (swingAnimation) {
                    swingAnimation.Stopped.Once(registerHit);
                    swingAnimation.Play();
                }
                playSound("ToolSwing.mp3");
            }
        });

        return () => {
            inputBeganConnection.Disconnect();
            childAddedConnection?.Disconnect();
            childRemovedConnection?.Disconnect();
            cleanup();
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
            equipGear(equipping.item.id);
        });

        return () => connection.Disconnect();
    }, [gears]);

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
