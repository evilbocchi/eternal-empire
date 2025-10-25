/**
 * @fileoverview Build system manager component
 *
 * High-level manager that bridges build controller logic with the new React UI.
 * Manages state synchronization and provides callbacks for build operations.
 */

import { getAllInstanceInfo, weldModel } from "@antivivi/vrldk";
import { Debris, HttpService, ReplicatedStorage, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import { RepairManager } from "client/components/item/RepairWindow";
import ShopManager from "client/components/item/shop/ShopManager";
import SingleDocumentManager from "client/components/sidebar/SingleDocumentManager";
import { showErrorToast } from "client/components/toast/ToastService";
import DocumentManager from "client/components/window/DocumentManager";
import { getSound, playSound } from "shared/asset/GameAssets";
import { CAMERA, PLACED_ITEMS_FOLDER } from "shared/constants";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import ItemPlacement from "shared/placement/ItemPlacement";
import Sandbox from "shared/Sandbox";
import { AREAS } from "shared/world/Area";
import BuildGrid from "shared/world/nodes/BuildGrid";

declare global {
    interface InstanceInfo {
        /** The initial position of the model when it was selected for placement. Client-side only. */
        initialPosition?: Vector3;
        /** The initial rotation of the model when it was selected for placement. Client-side only. */
        initialRotation?: number;
    }
}

namespace BuildManager {
    export const COLLISION_COLOR = new Color3(1, 0, 0);
    export const NONCOLLISION_COLOR = Color3.fromRGB(35, 120, 172);

    /**
     * Offset of the selected models from the mouse.
     * The main selection has a blank identity CFrame.
     */
    export const selected = new Map<Model, CFrame>();
    export let mainSelected: Model | undefined;
    let lastPreviewDifficultyId: string | undefined;

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
    const PLACING_RAYCAST_PARAMS = new RaycastParams();
    PLACING_RAYCAST_PARAMS.FilterType = Enum.RaycastFilterType.Exclude;
    PLACING_RAYCAST_PARAMS.FilterDescendantsInstances = [PLACED_ITEMS_FOLDER];
    const SELECTING_RAYCAST_PARAMS = new RaycastParams();
    SELECTING_RAYCAST_PARAMS.FilterType = Enum.RaycastFilterType.Include;
    SELECTING_RAYCAST_PARAMS.FilterDescendantsInstances = [PLACED_ITEMS_FOLDER];

    let lastRotate = 0;
    let lastMovedTo = 0;
    let lastMovedToCFrame = new CFrame();
    let lastSelectingCFrame = new CFrame();
    let lastCameraCFrame = new CFrame();
    export let isShopOpen = false;
    export let isSingleDocumentOpen = false;

    function getPrimarySelectedModel() {
        if (mainSelected !== undefined) return mainSelected;
        for (const [model] of selected) {
            return model;
        }
        return undefined;
    }

    function syncPreviewTool() {
        let difficultyId: string | undefined;

        if (!selected.isEmpty()) {
            const model = getPrimarySelectedModel();
            if (model !== undefined) {
                const modelInfo = getAllInstanceInfo(model);
                const itemId = modelInfo.itemId;
                if (itemId !== undefined) {
                    const item = Items.getItem(itemId);
                    const candidate = item?.difficulty?.id;
                    if (candidate !== undefined && candidate !== "") {
                        difficultyId = candidate;
                    }
                }
            }
        }

        if (difficultyId !== lastPreviewDifficultyId) {
            Packets.setBuildPreviewTool.toServer(difficultyId ?? "");
            lastPreviewDifficultyId = difficultyId;
        }
    }

    export function hasSelection(): boolean {
        return !selected.isEmpty();
    }

    syncPreviewTool();
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
        return Packets.permLevels.get().build > Packets.permLevel.get() || isShopOpen;
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
        syncPreviewTool();
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
     * Applies bounce animation to a model.
     * @param model The model to animate.
     */
    function applyBounceAnimation(model: Model) {
        // Mark the time when bounce animation starts
        model.SetAttribute("BounceAnimationStartTime", os.clock());

        // Apply bounce animation after initial positioning
        task.spawn(() => {
            const primaryPart = model.PrimaryPart!;
            const indicator = primaryPart.FindFirstChild("Indicator") as BasePart;
            if (indicator === undefined) return;

            const targetCFrame = indicator.CFrame;

            // Set initial rotated state
            const off = math.rad(35);
            const randomOff = () => (math.random(0, 1) === 0 ? -off : off);
            primaryPart.CFrame = targetCFrame.mul(CFrame.Angles(randomOff(), randomOff(), randomOff()));

            // Animate to target rotation
            const tween = TweenService.Create(
                primaryPart,
                new TweenInfo(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                {
                    CFrame: targetCFrame,
                },
            );
            tween.Play();

            // Clear the bounce animation flag after animation completes
            tween.Completed.Connect(() => {
                model.SetAttribute("BounceAnimationStartTime", undefined);
            });
        });
    }

    /**
     * Selects the main model for placement.
     * @param model The model to select.
     */
    export function mainSelect(model: Model) {
        selected.set(model, new CFrame());
        preselectCFrame = model.PrimaryPart!.CFrame;
        mainSelected = model;
        const modelInfo = getAllInstanceInfo(model);
        rotationValue.Value = modelInfo.initialRotation ?? 0;

        hover(undefined);
        model.SetAttribute("Selected", true);
        refresh();
        onMouseMove(true, false);

        applyBounceAnimation(model);
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
        const data = new Set<PlacingInfo>();
        let hasAnyItems = false;
        for (const [selectedModel] of selected) {
            const modelInfo = getAllInstanceInfo(selectedModel);

            const placedItem = modelInfo.placedItem;
            if (placedItem === undefined) continue;

            const position = modelInfo.initialPosition;
            if (position === undefined) continue;

            const rotation = modelInfo.initialRotation;
            if (rotation === undefined) continue;

            const id = placedItem.uniqueItemId ?? modelInfo.itemId;
            if (id === undefined) continue;

            hasAnyItems = true;
            data.add({
                id,
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
     * @param placedItem The placed item data.
     * @returns The created item model.
     */
    export function addPlacingModel(placedItem: PlacedItem) {
        debounce = tick();
        const item = Items.getItem(placedItem.item);
        if (item === undefined) throw `Item ${placedItem.item} does not exist!`;

        const itemModel = item.createModel(placedItem);
        if (itemModel === undefined) throw `Item ${item.name} has no model!`;

        for (const desc of itemModel.GetDescendants()) {
            if (desc.IsA("BasePart")) {
                desc.CanCollide = false;
            }
        }

        const modelInfo = getAllInstanceInfo(itemModel);
        modelInfo.initialPosition = new Vector3(placedItem.posX, placedItem.posY, placedItem.posZ);
        modelInfo.initialRotation = placedItem.rawRotation;

        itemModel.Name = HttpService.GenerateGUID(false);
        itemModel.AddTag("Placing");
        itemModel.SetAttribute("Selected", true);
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
     */
    export function placeSelected() {
        if (mainSelected === undefined) return "Nothing selected.";

        const data = new Set<PlacingInfo>();

        const areaId = Packets.currentArea.get();
        let buildBounds = baseplateBounds;
        if (areaId !== undefined) {
            buildBounds ??= AREAS[areaId].buildBounds;
        }
        if (buildBounds === undefined) return "Cannot build here.";

        const grid = buildBounds.grid;
        if (grid === undefined) return "Cannot build here.";
        const gridRotation = grid.Orientation.Y;

        for (const [selectedModel] of selected) {
            const modelInfo = getAllInstanceInfo(selectedModel);

            const itemId = modelInfo.itemId;
            if (itemId === undefined) return "Item ID missing.";

            const item = Items.getItem(itemId);
            if (item === undefined) return `Item ${itemId} does not exist.`;

            if (ItemPlacement.isTouchingPlacedItem(selectedModel)) return "Cannot place item here.";

            if (baseplateBounds === undefined && !ItemPlacement.isInPlaceableArea(selectedModel, item))
                return "Cannot place item here.";

            const primaryPart = selectedModel.PrimaryPart!;
            const indicator = primaryPart.FindFirstChild("Indicator") as BasePart;
            if (indicator === undefined) return "Indicator not found.";
            const position = indicator.Position;

            // find the single number rotation from the CFrame
            const lookVector = primaryPart.CFrame.LookVector;
            let rotation = math.floor(math.deg(math.atan2(-lookVector.X, -lookVector.Z)) - gridRotation + 180); // angle of look vector in xz plane (0-360)
            rotation %= 360;

            const id = modelInfo.placedItem?.uniqueItemId ?? item.id;

            data.add({ id, position, rotation });
        }
        debounce = tick();

        const status = Packets.placeItems.toServer(data);
        if (status === 0) return "Server rejected placement.";

        if (status === 1) {
            deselectAll();
        }
    }

    /**
     * Handles mouse movement for selection and placement logic.
     * @param changePos Whether to update position.
     * @param animate Whether to animate movement.
     */
    export function onMouseMove(changePos = true, animate = animationsEnabled) {
        const size = selected.size();
        const nothingSelected = size === 0;

        const mouseLocation = Environment.UserInput.GetMouseLocation();
        const viewRay = CAMERA.ViewportPointToRay(mouseLocation.X, mouseLocation.Y);
        const ray = Workspace.Raycast(
            viewRay.Origin,
            viewRay.Direction.mul(100),
            nothingSelected ? SELECTING_RAYCAST_PARAMS : PLACING_RAYCAST_PARAMS,
        );

        if (nothingSelected === true) {
            // nothing selected, perform hovering logic
            const target = ray?.Instance;
            let hovering = target?.Parent;
            if (
                hovering === undefined ||
                !hovering.IsA("Model") ||
                hovering.Parent !== PLACED_ITEMS_FOLDER ||
                target?.HasTag("Unhoverable") === true ||
                target?.FindFirstChildOfClass("ClickDetector") !== undefined
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
        if (ray === undefined) return;

        // something is selected, perform moving logic
        const areaId = Packets.currentArea.get();
        let buildBounds = baseplateBounds;
        if (areaId !== undefined) {
            buildBounds ??= AREAS[areaId].buildBounds;
        }
        if (buildBounds === undefined) return;

        const rotation = rotationValue.Value;
        let cframe: CFrame | undefined;
        if (changePos === true) {
            cframe = new CFrame(ray.Position);
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
     * Handles mouse up events for placement and selection finalization.
     * @param useCurrentPos If true, uses the current position for placement.
     */
    export function onMouseUp(useCurrentPos?: boolean) {
        if (getRestricted() === true) return;

        clicking = false;

        const size = selected.size();
        if (size === 0) {
            // nothing to place, select dragged items
            const main = hovering;
            if (main !== undefined) {
                const names = new Set<string>();
                const modelsToAnimate = new Array<Model>();
                let selectedCount = 0;

                for (const model of dragging) {
                    names.add(model.Name);

                    const modelInfo = getAllInstanceInfo(model);
                    if (modelInfo.broken === true) {
                        RepairManager.setRepairing(model);
                        for (const model of dragging) model.SetAttribute("Dragging", false);
                        dragging.clear();
                        return;
                    }

                    const placedItem = modelInfo.placedItem;
                    if (placedItem === undefined) continue;

                    const placingModel = addPlacingModel(placedItem);

                    if (model === main) {
                        // Main selection
                        selected.set(placingModel, new CFrame());
                        preselectCFrame = placingModel.PrimaryPart!.CFrame;
                        mainSelected = placingModel;
                        const modelInfo = getAllInstanceInfo(placingModel);
                        rotationValue.Value = modelInfo.initialRotation ?? 0;
                        hover(undefined);
                        placingModel.SetAttribute("Selected", true);
                        selectedCount++;
                        modelsToAnimate.push(placingModel);
                    } else if (selectedCount < 10) {
                        // Additional models (up to 10 total)
                        selected.set(placingModel, main.PrimaryPart!.CFrame.Inverse().mul(model.PrimaryPart!.CFrame));
                        placingModel.SetAttribute("Selected", true);
                        selectedCount++;
                        modelsToAnimate.push(placingModel);
                    } else {
                        // Beyond 10 models - select but don't animate
                        selected.set(placingModel, main.PrimaryPart!.CFrame.Inverse().mul(model.PrimaryPart!.CFrame));
                        placingModel.SetAttribute("Selected", true);
                    }
                    model.SetAttribute("Dragging", false);
                }

                playSound("Pickup.mp3");
                Packets.unplaceItems.toServer(names);
                refresh();

                // Position all models first with animations disabled
                onMouseMove(true, false);

                // Then apply bounce animations to all selected models
                for (const model of modelsToAnimate) {
                    applyBounceAnimation(model);
                }
            }

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
            const result = placeSelected();
            if (result === undefined) {
                playSound("Place.mp3", undefined, (sound) => {
                    sound.PlaybackSpeed = 1 / (size + 5) + 0.84;
                    sound.Volume = 0.7;
                });
            } else {
                playSound("Error.mp3");
                showErrorToast(result);
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

        const cframeConnection = CAMERA.GetPropertyChangedSignal("CFrame").Connect(() => {
            if (UserInputService.TouchEnabled === true && !selected.isEmpty()) return;
            onMouseMove();
        });

        const inputBeganConnection = Environment.UserInput.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true) return;
            if (isSingleDocumentOpen) return;

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

        const touchEndedConnection = Environment.UserInput.TouchEnded.Connect((_touch, gameProcessed) => {
            if (gameProcessed === true) return;
            if (isSingleDocumentOpen) return;
            onMouseUp();
        });

        const inputChangedConnection = Environment.UserInput.InputChanged.Connect((input, gameProcessed) => {
            if (gameProcessed === true) return;
            if (isSingleDocumentOpen) return;
            if (input.UserInputType === Enum.UserInputType.MouseMovement) {
                onMouseMove();
            }
        });

        const inputEndedConnection = Environment.UserInput.InputEnded.Connect((input, gameProcessed) => {
            if (gameProcessed === true) return;
            if (isSingleDocumentOpen) return;

            if (input.UserInputType !== Enum.UserInputType.MouseButton1 && input.KeyCode !== Enum.KeyCode.ButtonL1)
                return;

            onMouseUp();
        });

        const permLevelsConnection = Packets.permLevels.observe(refresh);
        const permLevelConnection = Packets.permLevel.observe(refresh);
        const shopGuiEnabledConnection = ShopManager.opened.connect((shop) => {
            isShopOpen = shop !== undefined;
            refresh();
        });
        const documentConnection = DocumentManager.visibilityChanged.connect(() => {
            isSingleDocumentOpen = SingleDocumentManager.activeDocument !== undefined;
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
            documentConnection.Disconnect();
            childRemovedConnection.Disconnect();
        };
    }
}

export default BuildManager;
