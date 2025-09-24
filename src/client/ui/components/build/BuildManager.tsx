/**
 * @fileoverview Build system manager component
 *
 * High-level manager that bridges build controller logic with the new React UI.
 * Manages state synchronization and provides callbacks for build operations.
 */

import { weldModel } from "@antivivi/vrldk";
import { Debris, HttpService, ReplicatedStorage, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, MOUSE, NONCOLLISION_COLOR } from "client/constants";
import { ShopManager } from "client/ui/components/item/shop/ShopGui";
import DocumentManager from "client/ui/components/window/DocumentManager";
import { getSound, playSound } from "shared/asset/GameAssets";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import ItemPlacement from "shared/placement/ItemPlacement";
import Sandbox from "shared/Sandbox";
import { AREAS } from "shared/world/Area";
import BuildGrid from "shared/world/nodes/BuildGrid";

namespace BuildManager {
    /**
     * Offset of the selected models from the mouse.
     * The main selection has a blank identity CFrame.
     */
    export const selected = new Map<Model, CFrame>();
    export let mainSelected: Model | undefined;

    export const rotationValue = new Instance("IntValue");

    /**
     * CFrame of the main model in {@link selected} before it was selected.
     */
    export let preselectCFrame: CFrame | undefined;

    /**
     * The model that is currently being hovered over by the player's mouse.
     */
    export let hovering: Model | undefined;

    export let clicking = false;

    export const baseplateBounds = Sandbox.createBaseplateBounds();

    export const dragging = new Set<Model>();

    export let animationsEnabled = true;
    export let debounce = 0;
    export const MOVETWEENINFO = new TweenInfo(0.25, Enum.EasingStyle.Back, Enum.EasingDirection.Out);
    let lastRotate = 0;
    let lastMovedTo = 0;
    let lastMovedToCFrame = new CFrame();
    let lastSelectingCFrame = new CFrame();
    let lastCameraCFrame = new CFrame();
    export let isShopOpen = false;

    export function hasSelection(): boolean {
        return !selected.isEmpty();
    }

    export function rotateSelection(): void {
        const rotateSound = getSound("ItemRotate.mp3").Clone();
        const pitchDecrement = math.min(tick() - lastRotate, 0.5) * 0.25;
        rotateSound.PlaybackSpeed = 1 + 0.25 - pitchDecrement;
        rotateSound.Parent = ReplicatedStorage;
        rotateSound.Play();
        Debris.AddItem(rotateSound, 1.5);
        lastRotate = tick();

        if (rotationValue.Value >= 270) {
            rotationValue.Value = 0;
        } else {
            rotationValue.Value += 90;
        }
        onMouseMove(!UserInputService.TouchEnabled);
    }

    export function deleteSelection(): void {
        playSound("Unplace.mp3");
        deselectAll();
    }

    export function placeSelection(): void {
        onMouseUp(true);
    }

    /**
     * Whether the player is restricted from building.
     * @returns True if restricted, false otherwise.
     */
    export function getRestricted() {
        const buildLevel = (LOCAL_PLAYER.GetAttribute("PermissionLevel") as number | undefined) ?? 0;
        return (Packets.permLevels.get().build ?? 0) > buildLevel || isShopOpen;
    }

    /**
     * Refreshes the build UI state and notifies React components of changes.
     */
    export function refresh() {
        const isEmpty = selected.isEmpty();
        if (isEmpty || getRestricted() === true) {
            if (!isEmpty) {
                revertSelected();
                deselectAll(true);
            }
            preselectCFrame = undefined;
            mainSelected = undefined;
            BuildGrid.setTransparency(1);
            Workspace.SetAttribute("BuildMode", false);
            DocumentManager.setVisible("Build", false);
        } else {
            BuildGrid.setTransparency(0.8);
            Workspace.SetAttribute("BuildMode", true);
            DocumentManager.setVisible("Build", true);
        }
    }

    /**
     * Updates hovering states of models.
     * @param model The model to set as hovering.
     */
    export function hover(model: Model | undefined) {
        const lastHovering = hovering;
        if (lastHovering !== undefined) {
            lastHovering.SetAttribute("Hovering", false);
        }
        if (model !== undefined) {
            if (selected.has(model))
                // don't hover over selected models
                return;

            model.SetAttribute("Hovering", true);
        }
        hovering = model;
    }

    /**
     * Selects the main model for placement.
     * @param model The model to select.
     */
    export function mainSelect(model: Model) {
        selected.set(model, new CFrame());
        preselectCFrame = model.PrimaryPart!.CFrame;
        mainSelected = model;
        rotationValue.Value = (model.GetAttribute("InitialRotation") as number) ?? 0;

        hover(undefined);
        model.SetAttribute("Selected", true);
        refresh();
        onMouseMove(true, false);
    }

    /**
     * Deselects a model and removes it from selection.
     * @param model The model to deselect.
     */
    export function deselect(model: Model) {
        model.Destroy();
        selected.delete(model);
        refresh();
    }

    /**
     * Deselects all models.
     * @param noRefresh If true, skips UI refresh.
     */
    export function deselectAll(noRefresh?: boolean) {
        for (const [model] of selected) model.Destroy();
        selected.clear();
        if (noRefresh !== true) refresh();
    }

    /**
     * Reverts selected items to their initial positions and rotations.
     */
    export function revertSelected() {
        const data = new Array<PlacingInfo>();
        let hasAnyItems = false;
        for (const [selectedModel] of selected) {
            const position = selectedModel?.GetAttribute("InitialPosition") as Vector3 | undefined;
            if (position === undefined) continue;
            const rotation = selectedModel?.GetAttribute("InitialRotation") as number | undefined;
            if (rotation === undefined) continue;

            hasAnyItems = true;
            data.push({
                id: (selectedModel.GetAttribute("UUID") ?? selectedModel.GetAttribute("ItemId")) as string,
                position,
                rotation,
            });
        }
        if (hasAnyItems === true) {
            Packets.placeItems.toServer(data);
        }
    }

    /**
     * Adds a model for placement, setting up attributes and selection visuals.
     * @param item The item to place.
     * @param uuid The unique identifier for the item (optional).
     * @param initialPosition The initial position for placement (optional).
     * @param initialRotation The initial rotation for placement (optional).
     * @returns The created item model.
     */
    export function addPlacingModel(item: Item, uuid?: string, initialPosition?: Vector3, initialRotation?: number) {
        debounce = tick();
        const itemModel = item.MODEL?.Clone();
        if (itemModel === undefined) throw `Item ${item.name} has no model!`;

        itemModel.Name = HttpService.GenerateGUID(false);
        itemModel.AddTag("Placing");
        itemModel.SetAttribute("Selected", true);
        itemModel.SetAttribute("ItemName", item.name);
        itemModel.SetAttribute("ItemId", item.id);
        itemModel.SetAttribute("InitialPosition", initialPosition);
        itemModel.SetAttribute("InitialRotation", initialRotation);
        if (uuid !== undefined) {
            itemModel.SetAttribute("UUID", uuid);
        }
        weldModel(itemModel); // we are using tweens on primarypart

        const primaryPart = itemModel.PrimaryPart!;
        const indicator = new Instance("Part");
        indicator.Transparency = 1;
        indicator.CanCollide = false;
        indicator.Anchored = true;
        indicator.CFrame = primaryPart.CFrame;
        indicator.Size = primaryPart.Size;
        indicator.Name = "Indicator";

        const selectionBox = new Instance("SelectionBox");
        selectionBox.Adornee = indicator;
        selectionBox.Transparency = 0.35;
        selectionBox.SurfaceTransparency = 0.75;
        selectionBox.Color3 = NONCOLLISION_COLOR;
        selectionBox.SurfaceColor3 = NONCOLLISION_COLOR;

        indicator.Parent = primaryPart;
        selectionBox.Parent = indicator;

        itemModel.Parent = PLACED_ITEMS_FOLDER;

        return itemModel;
    }

    /**
     * Attempts to place all selected items in the world.
     * @returns True if placement succeeded, false otherwise.
     */
    export function placeSelected() {
        if (mainSelected === undefined) return false;

        const data = new Array<PlacingInfo>();
        let item: Item | undefined;

        const areaId = LOCAL_PLAYER.GetAttribute("Area") as AreaId | undefined;
        let buildBounds = baseplateBounds;
        if (areaId !== undefined) {
            buildBounds ??= AREAS[areaId].buildBounds;
        }
        if (buildBounds === undefined) return;

        const grid = buildBounds.grid;
        if (grid === undefined) return;
        const gridRotation = grid.Orientation.Y;

        for (const [selectedModel] of selected) {
            const itemId = selectedModel.GetAttribute("ItemId") as string | undefined;
            if (itemId === undefined) return false;
            item = Items.getItem(itemId);
            if (item === undefined) return false;

            if (ItemPlacement.isTouchingPlacedItem(selectedModel)) return false;

            if (baseplateBounds === undefined && !ItemPlacement.isInPlaceableArea(selectedModel, item)) return false;

            const primaryPart = selectedModel.PrimaryPart!;
            const indicator = primaryPart.FindFirstChild("Indicator") as BasePart;
            if (indicator === undefined) return false;
            const position = indicator.Position;

            // find the single number rotation from the CFrame
            const lookVector = primaryPart.CFrame.LookVector;
            let rotation = math.floor(math.deg(math.atan2(-lookVector.X, -lookVector.Z)) - gridRotation + 180); // angle of look vector in xz plane (0-360)
            rotation %= 360;

            const id = (selectedModel.GetAttribute("UUID") as string | undefined) ?? item.id;

            data.push({ id, position, rotation });
        }
        debounce = tick();

        const status = Packets.placeItems.toServer(data);
        if (status === 0) return false;

        if (status === 1) {
            deselectAll();
        }
        for (const [selectedModel] of selected) {
            selectedModel.SetAttribute("InitialPosition", undefined);
            selectedModel.SetAttribute("InitialRotation", undefined);
        }

        return true;
    }

    /**
     * Handles mouse movement for selection and placement logic.
     * @param changePos Whether to update position.
     * @param animate Whether to animate movement.
     */
    export function onMouseMove(changePos = true, animate = animationsEnabled) {
        const size = selected.size();
        if (size === 0) {
            // nothing selected, perform hovering logic
            MOUSE.TargetFilter = undefined;
            const target = MOUSE.Target;
            if (target === undefined) return;

            let hovering = target.Parent;
            if (
                hovering === undefined ||
                !hovering.IsA("Model") ||
                hovering.Parent !== PLACED_ITEMS_FOLDER ||
                target.HasTag("Unhoverable") === true ||
                target.FindFirstChildOfClass("ClickDetector") !== undefined
            ) {
                hovering = undefined;
            }

            if (hovering !== undefined && clicking === true) {
                dragging.add(hovering);
                hovering.SetAttribute("Dragging", true);
            }

            hover(hovering);
            return;
        }

        // something is selected, perform moving logic
        const areaId = LOCAL_PLAYER.GetAttribute("Area") as AreaId | undefined;
        let buildBounds = baseplateBounds;
        if (areaId !== undefined) {
            buildBounds ??= AREAS[areaId].buildBounds;
        }
        if (buildBounds === undefined) return;

        MOUSE.TargetFilter = PLACED_ITEMS_FOLDER;

        const rotation = rotationValue.Value;
        let cframe: CFrame | undefined;
        if (changePos === true) {
            cframe = MOUSE.Hit;
        } else {
            cframe = mainSelected!.PrimaryPart!.CFrame;
        }

        cframe = buildBounds.snap(
            mainSelected!.PrimaryPart!.Size,
            cframe.Position,
            math.rad(rotation),
            rotation % 90 !== 0,
        );
        if (cframe === undefined || cframe.FuzzyEq(lastMovedToCFrame)) {
            return;
        }

        for (const [selectedModel, offset] of selected) {
            const primaryPart = selectedModel.PrimaryPart;
            if (primaryPart === undefined) continue;
            const indicator = primaryPart.FindFirstChild("Indicator");
            if (indicator === undefined) continue;

            const relative = cframe.mul(offset);
            (indicator as BasePart).CFrame = relative;

            if (animate === true) TweenService.Create(primaryPart, MOVETWEENINFO, { CFrame: relative }).Play();
            else primaryPart.CFrame = relative;
        }
        const lastSound = tick() - lastMovedTo;
        if (lastSound > 0.05) {
            const moveSound = getSound("ItemMove.mp3").Clone();
            const pitchDecrement = math.min(lastSound, 0.5) * 0.5;
            lastMovedTo = tick();
            moveSound.PlaybackSpeed = 1 + 0.5 - pitchDecrement;
            moveSound.Volume = 0.35;
            moveSound.Parent = ReplicatedStorage;
            moveSound.Play();
            Debris.AddItem(moveSound, 1.5);
        }
        lastMovedToCFrame = cframe;
    }

    /**
     * Handles mouse down events for selection and dragging.
     */
    export function onMouseDown() {
        if (getRestricted() === true) return;

        clicking = true;

        const cameraCFrame = Workspace.CurrentCamera?.CFrame ?? new CFrame();
        if (UserInputService.TouchEnabled && !lastCameraCFrame.FuzzyEq(cameraCFrame)) {
            onMouseMove();
        }
        lastCameraCFrame = cameraCFrame;
    }

    /**
     * Handles mouse up events for placement and dragging.
     * @param useCurrentPos If true, uses the current position for placement.
     */
    export function onMouseUp(useCurrentPos?: boolean) {
        if (getRestricted() === true) return;

        clicking = false;

        const size = selected.size();
        if (size === 0) {
            // nothing selected, handle dragging
            if (hovering !== undefined) {
                playSound("Pickup.mp3");
                const names = new Array<string>();
                for (const model of dragging) {
                    names.push(model.Name);
                    const placingModel = addPlacingModel(
                        Items.getItem(model.GetAttribute("ItemId") as string)!,
                        model.GetAttribute("UUID") as string | undefined,
                        model.PrimaryPart?.Position,
                        (model.GetAttribute("Rotation") as number | undefined) ?? 0,
                    );
                    if (model === hovering) {
                        mainSelect(placingModel);
                    } else {
                        selected.set(
                            placingModel,
                            hovering.PrimaryPart!.CFrame.Inverse().mul(model.PrimaryPart!.CFrame),
                        );
                    }
                }
                Packets.unplaceItems.toServer(names);
                onMouseMove(true, false);
            }

            for (const model of dragging) model.SetAttribute("Dragging", false);
            dragging.clear();
            return;
        }

        const selectingCFrame = (mainSelected!.PrimaryPart!.FindFirstChild("Indicator") as BasePart).CFrame;
        if (
            UserInputService.TouchEnabled === false ||
            useCurrentPos === true ||
            lastSelectingCFrame === selectingCFrame
        ) {
            for (const [selectedModel] of selected) {
                const primaryPart = selectedModel.PrimaryPart;
                if (primaryPart === undefined) continue;
                const indicator = primaryPart.FindFirstChild("Indicator") as BasePart;
                if (indicator === undefined) continue;
                primaryPart.CFrame = indicator.CFrame; // snap to indicator
            }
            if (placeSelected() === true) {
                playSound("Place.mp3", undefined, (sound) => {
                    sound.PlaybackSpeed = 1 / (size + 5) + 0.84;
                    sound.Volume = 0.7;
                });
            } else {
                playSound("Error.mp3");
            }
            lastSelectingCFrame = selectingCFrame;
            return;
        }
        lastSelectingCFrame = selectingCFrame;
    }

    /**
     * Initializes the BuildController, sets up hotkeys, listeners, and build mode UI.
     */
    export function init() {
        const settingsConnection = Packets.settings.observe((value) => (animationsEnabled = value.BuildAnimation));

        const cframeConnection = Workspace.CurrentCamera?.GetPropertyChangedSignal("CFrame").Connect(() => {
            if (UserInputService.TouchEnabled === true && !selected.isEmpty()) return;
            onMouseMove();
        });

        const inputBeganConnection = UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true) return;

            if (
                input.UserInputType === Enum.UserInputType.Touch ||
                input.UserInputType === Enum.UserInputType.MouseButton1 ||
                input.KeyCode === Enum.KeyCode.ButtonL1
            ) {
                onMouseDown();
                if (selected.isEmpty()) {
                    onMouseMove();
                }
            }
        });

        const touchEndedConnection = UserInputService.TouchEnded.Connect((_touch, gameProcessed) => {
            if (gameProcessed === true) return;
            onMouseUp();
        });

        const inputChangedConnection = UserInputService.InputChanged.Connect((input, gameProcessed) => {
            if (gameProcessed === true) return;
            if (input.UserInputType === Enum.UserInputType.MouseMovement) {
                onMouseMove();
            }
        });

        const inputEndedConnection = UserInputService.InputEnded.Connect((input, gameProcessed) => {
            if (gameProcessed === true) return;

            if (input.UserInputType !== Enum.UserInputType.MouseButton1 && input.KeyCode !== Enum.KeyCode.ButtonL1)
                return;

            onMouseUp();
        });

        const permLevelsConnection = Packets.permLevels.observe(() => refresh());
        const permLevelConnection = LOCAL_PLAYER.GetAttributeChangedSignal("PermissionLevel").Connect(() => refresh());
        const shopGuiEnabledConnection = ShopManager.opened.connect((shop) => {
            isShopOpen = shop !== undefined;
            refresh();
        });

        const childRemovedConnection = PLACED_ITEMS_FOLDER.ChildRemoved.Connect((model) => {
            if (model.IsA("Model") && selected.has(model)) {
                deselect(model);
            }
        });

        return () => {
            settingsConnection.Disconnect();
            cframeConnection?.Disconnect();
            inputBeganConnection.Disconnect();
            touchEndedConnection.Disconnect();
            inputChangedConnection.Disconnect();
            inputEndedConnection.Disconnect();
            permLevelsConnection.Disconnect();
            permLevelConnection.Disconnect();
            shopGuiEnabledConnection.Disconnect();
            childRemovedConnection.Disconnect();
        };
    }
}

export default BuildManager;
