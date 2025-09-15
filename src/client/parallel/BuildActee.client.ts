//!optimize 2
//!native

/**
 * @fileoverviewside script for managing item placement in build mode.
 *
 * Handles:
 * - Loading and managing item models for placement.
 * - Visual indicators for item placement (e.g., outlines, highlights).
 * - Collision detection and response for placed items.
 * - Special effects for items with specific traits (e.g., Conveyor, Charger).
 *
 * Handles build mode visuals and logic for item placement in the workspace.
 *
 * @since 1.0.0
 */

import { CollectionService, RunService, Workspace } from "@rbxts/services";
import { COLLISION_COLOR, MOUSE, NONCOLLISION_COLOR } from "client/constants";
import Area from "shared/world/Area";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { ASSETS } from "shared/asset/GameAssets";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Items from "shared/items/Items";
import Sandbox from "shared/Sandbox";
import ItemPlacement from "shared/placement/ItemPlacement";

declare global {
    interface Assets {
        ChargerRing: Beam;
    }
}

const sandboxEnabled = Sandbox.getEnabled();
const loadedModels = new Set<Model>();
let area: Area | undefined;

// Continuously load models for placed items in the workspace
RunService.BindToRenderStep("Build Load", 1, () => {
    const placedItems = PLACED_ITEMS_FOLDER.GetChildren();
    for (const child of placedItems) {
        onModelAdded(child);
    }
});

/**
 * Retrieves an instance of a given class and name from a parent, or creates it if missing.
 * @param parent The parent instance to search within.
 * @param className The class name of the instance to retrieve.
 * @param name The name of the instance to retrieve.
 * @returns The found or newly created instance.
 */
function retrieve<T extends ConstructorParameters<typeof Instance>[0]>(parent: Instance, className: T, name: string) {
    let instance = parent.FindFirstChild(name);
    if (instance === undefined) {
        instance = new Instance(className);
        instance.Name = name;
        instance.Parent = parent;
    }
    return instance as Instances[T];
}

/**
 * Handles logic when a model is added to the workspace for placement or display.
 * Sets up visuals, collision, and trait-specific effects.
 * @param model The model instance being added.
 */
function onModelAdded(model: Instance) {
    if (!model.IsA("Model") || loadedModels.has(model)) return;
    const itemId = model.GetAttribute("ItemId") as string;
    const item = Items.getItem(itemId);
    if (item === undefined) throw "Model " + model.Name + " does not have item defined";

    const isPlacing = model.GetAttribute("Selected") === true;
    const hitbox = model.PrimaryPart;
    if (hitbox === undefined) return;
    const conveyor = item.findTrait("Conveyor");
    const arrows = new Set<Beam>();

    /**
     * Loads and configures a child instance of the model for placement visuals.
     * @param instance The instance to process.
     */
    function loadInstance(instance: Instance) {
        // Handle conveyor trait: show arrows if present
        if (instance.Name === "Conveyor" && conveyor !== undefined) {
            if (isPlacing) {
                Conveyor.loadConveyorArrow(instance as BasePart, conveyor).Enabled = true;
            } else {
                const arrow = instance.FindFirstChildOfClass("Beam");
                if (arrow !== undefined) arrows.add(arrow);
            }
        }

        // Remove certain GUIs and beams during placement
        if (
            instance.IsA("BillboardGui") ||
            (instance.IsA("Beam") && conveyor === undefined) ||
            instance.IsA("SurfaceGui")
        ) {
            if (isPlacing === true) instance.Destroy();
        }
        // Make parts semi-transparent and non-collidable during placement
        else if (instance.IsA("BasePart") && isPlacing === true) {
            instance.CanCollide = false;
            instance.Transparency = 1 - (1 - instance.Transparency) / 2;
            instance.CastShadow = false;
        }
        // For nested models, ensure all parts are non-collidable during placement
        else if (instance.IsA("Model") && isPlacing) {
            const children = instance.GetChildren();
            for (const child of children) {
                if (child.IsA("BasePart")) {
                    child.CanCollide = false;
                }
            }
        }
    }

    // Process all children for placement visuals
    model.GetChildren().forEach(loadInstance);
    model.ChildAdded.Connect(loadInstance);

    if (isPlacing === true) {
        // Snap model to mouse if in a valid area
        if (area !== undefined && item.placeableAreas.includes(area)) {
            model.PivotTo(MOUSE.Hit);
        }
        // Show charger ring VFX if item has Charger trait
        const charger = item.findTrait("Charger");
        if (charger !== undefined) {
            task.spawn(() => {
                // Wait for connection VFX to exist (handles streaming delay)
                const connectionVFX = model.WaitForChild("ConnectionVFX", 1);

                // Use item difficulty color or fallback
                const color =
                    (connectionVFX?.FindFirstChild("w") as Beam | undefined)?.Color ??
                    new ColorSequence(item.difficulty.color ?? new Color3());
                const ring0 = ASSETS.ChargerRing.Clone();
                const ring1 = ASSETS.ChargerRing.Clone();
                const diameter = (charger.radius ?? 0) * 2 + hitbox.Size.X;
                const l0 = (11 / 18) * diameter;
                const l1 = (-12 / 18) * diameter;
                const attachment0 = new Instance("Attachment");
                const attachment1 = new Instance("Attachment");
                const yOffset = -(hitbox.Size.Y / 2);
                attachment0.Position = new Vector3(0, yOffset, diameter / 2 - 0.25);
                attachment1.Position = new Vector3(0, yOffset, -(diameter / 2 - 0.25));
                attachment0.Parent = hitbox;
                attachment1.Parent = hitbox;
                ring0.Color = color;
                ring1.Color = color;
                ring0.CurveSize0 = l0;
                ring0.CurveSize1 = l1;
                ring1.CurveSize0 = l1;
                ring1.CurveSize1 = l0;
                ring0.Attachment0 = attachment0;
                ring0.Attachment1 = attachment1;
                ring1.Attachment0 = attachment0;
                ring1.Attachment1 = attachment1;
                ring0.Parent = hitbox;
                ring1.Parent = hitbox;
                connectionVFX?.Destroy();
            });
        }

        const indicator = hitbox.WaitForChild("Indicator") as BasePart;

        // Update collision colors when the hitbox moves
        hitbox.GetPropertyChangedSignal("CFrame").Connect(() => {
            const selectionBox = indicator.FindFirstChildOfClass("SelectionBox");
            if (selectionBox === undefined) return;
            let isAcceptable = !ItemPlacement.isTouchingPlacedItem(model);
            if (!sandboxEnabled && !ItemPlacement.isInPlaceableArea(model, item)) isAcceptable = false;

            // Set indicator color based on placement validity
            if (isAcceptable) {
                selectionBox.Color3 = NONCOLLISION_COLOR;
                selectionBox.SurfaceColor3 = NONCOLLISION_COLOR;
            } else {
                selectionBox.Color3 = COLLISION_COLOR;
                selectionBox.SurfaceColor3 = COLLISION_COLOR;
            }
        });
    }

    /**
     * Disconnects build mode listeners for this model.
     */
    const destroy = () => {
        buildModeConnection.Disconnect();
    };

    let previousTransparency = 1;

    /**
     * Updates hitbox and selection visuals based on model state and workspace attributes.
     */
    const update = () => {
        // Only allow hitbox queries if not placing and in build mode
        hitbox.CanQuery = (Workspace.GetAttribute("BuildMode") as boolean) && !isPlacing;

        // Hide hitbox indicator if currently placing
        if (isPlacing) return;

        // Calculate transparency based on dragging, hovering, and build mode
        let transparency = 1;
        if (model.GetAttribute("Dragging") === true) transparency *= 0.6;

        if (model.GetAttribute("Hovering") === true) transparency *= 0.5;

        if (Workspace.GetAttribute("BuildMode") === true) transparency *= 0.7;

        if (transparency === previousTransparency) return;
        previousTransparency = transparency;

        // Show or hide selection box based on transparency
        if (transparency < 1) {
            const selectionBox = retrieve(hitbox, "SelectionBox", "HitboxIndicator");
            selectionBox.Adornee = hitbox;
            selectionBox.Transparency = transparency;
            selectionBox.SurfaceTransparency = transparency * 1.3 + 0.25;
            selectionBox.Color3 = NONCOLLISION_COLOR;
            selectionBox.SurfaceColor3 = NONCOLLISION_COLOR;
        } else {
            hitbox.FindFirstChild("HitboxIndicator")?.Destroy();
        }

        // Show/hide conveyor arrows based on transparency
        const arrowsVisible = transparency < 0.7;
        for (const arrow of arrows) {
            arrow.Enabled = arrowsVisible;
        }
    };

    // Listen for relevant attribute changes to update visuals
    const buildModeConnection = Workspace.GetAttributeChangedSignal("BuildMode").Connect(update);
    model.GetAttributeChangedSignal("Dragging").Connect(update);
    model.GetAttributeChangedSignal("Hovering").Connect(update);
    model.Destroying.Once(destroy);
    loadedModels.add(model);
    update();
}

type Interactive = Instance & { Enabled: boolean };

// Disable interactives during build mode
Workspace.GetAttributeChangedSignal("BuildMode").Connect(() => {
    for (const interactive of CollectionService.GetTagged("Interactive"))
        (interactive as Interactive).Enabled = !Workspace.GetAttribute("BuildMode") as boolean;
});
// Ensure new interactives are disabled if build mode is active
CollectionService.GetInstanceAddedSignal("Interactive").Connect((interactive) => {
    (interactive as Interactive).Enabled = !Workspace.GetAttribute("BuildMode") as boolean;
});
