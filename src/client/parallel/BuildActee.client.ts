//!optimize 2
//!native

import { CollectionService, RunService, Workspace } from "@rbxts/services";
import { COLLISION_COLOR, MOUSE, NONCOLLISION_COLOR } from "client/constants";
import Area from "shared/Area";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { ASSETS } from "shared/asset/GameAssets";
import Conveyor from "shared/item/traits/Conveyor";
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

RunService.BindToRenderStep("Build Load", 1, () => {
    const placedItems = PLACED_ITEMS_FOLDER.GetChildren();
    for (const child of placedItems) {
        onModelAdded(child);
    }
});

function retrieve<T extends ConstructorParameters<typeof Instance>[0]>(parent: Instance, className: T, name: string) {
    let instance = parent.FindFirstChild(name);
    if (instance === undefined) {
        instance = new Instance(className);
        instance.Name = name;
        instance.Parent = parent;
    }
    return instance as Instances[T];
}

function onModelAdded(model: Instance) {
    if (!model.IsA("Model") || loadedModels.has(model))
        return;
    const itemId = model.GetAttribute("ItemId") as string;
    const item = Items.getItem(itemId);
    if (item === undefined)
        throw "Model " + model.Name + " does not have item defined";

    const isPlacing = model.GetAttribute("Selected") === true;
    const hitbox = model.PrimaryPart;
    if (hitbox === undefined)
        return;
    const conveyor = item.findTrait("Conveyor");
    const arrows = new Set<Beam>();

    function loadInstance(instance: Instance) {
        if (instance.Name === "Conveyor" && conveyor !== undefined) {
            if (isPlacing) {
                Conveyor.loadConveyorArrow(instance as BasePart, conveyor).Enabled = true;
            }
            else {
                const arrow = instance.FindFirstChildOfClass("Beam");
                if (arrow !== undefined)
                    arrows.add(arrow);
            }
        }

        if (instance.IsA("BillboardGui") || (instance.IsA("Beam") && conveyor === undefined) || instance.IsA("SurfaceGui")) {
            if (isPlacing === true)
                instance.Destroy();
        }
        else if (instance.IsA("BasePart") && isPlacing === true) {
            instance.CanCollide = false;
            instance.Transparency = 1 - ((1 - instance.Transparency) / 2);
            instance.CastShadow = false;
        }
        else if (instance.IsA("Model") && isPlacing) {
            const children = instance.GetChildren();
            for (const child of children) {
                if (child.IsA("BasePart")) {
                    child.CanCollide = false;
                }
            }
        }
    }

    model.GetChildren().forEach(loadInstance);
    model.ChildAdded.Connect(loadInstance);

    if (isPlacing === true) {
        if (area !== undefined && item.placeableAreas.includes(area)) {
            model.PivotTo(MOUSE.Hit);
        }
        const charger = item.findTrait("Charger");
        if (charger !== undefined) {
            task.spawn(() => {
                const connectionVFX = model.WaitForChild("ConnectionVFX", 1); // race condition with streaming

                const color = (connectionVFX?.FindFirstChild("w") as Beam | undefined)?.Color ?? new ColorSequence(item.difficulty.color ?? new Color3());
                const ring0 = ASSETS.ChargerRing.Clone();
                const ring1 = ASSETS.ChargerRing.Clone();
                const diameter = (charger.radius ?? 0) * 2 + hitbox.Size.X;
                const l0 = 11 / 18 * diameter;
                const l1 = -12 / 18 * diameter;
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

        // update collision colors when the hitbox moves
        hitbox.GetPropertyChangedSignal("CFrame").Connect(() => {
            const selectionBox = indicator.FindFirstChildOfClass("SelectionBox");
            if (selectionBox === undefined)
                return;
            let isAcceptable = !ItemPlacement.isTouchingPlacedItem(model);
            if (!sandboxEnabled && !ItemPlacement.isInPlaceableArea(model, item))
                isAcceptable = false;

            if (isAcceptable) {
                selectionBox.Color3 = NONCOLLISION_COLOR;
                selectionBox.SurfaceColor3 = NONCOLLISION_COLOR;
            }
            else {
                selectionBox.Color3 = COLLISION_COLOR;
                selectionBox.SurfaceColor3 = COLLISION_COLOR;
            }
        });
    }
    const destroy = () => {
        buildModeConnection.Disconnect();
    };

    let previousTransparency = 1;
    const update = () => {
        hitbox.CanQuery = Workspace.GetAttribute("BuildMode") as boolean && !isPlacing;

        if (isPlacing) // disable hitbox indicator when selected. we have a different selection indicator for that
            return;

        let transparency = 1;
        if (model.GetAttribute("Dragging") === true)
            transparency *= 0.6;

        if (model.GetAttribute("Hovering") === true)
            transparency *= 0.5;

        if (Workspace.GetAttribute("BuildMode") === true)
            transparency *= 0.7;

        if (transparency === previousTransparency)
            return;
        previousTransparency = transparency;

        if (transparency < 1) {
            const selectionBox = retrieve(hitbox, "SelectionBox", "HitboxIndicator");
            selectionBox.Adornee = hitbox;
            selectionBox.Transparency = transparency; // fixed the reference to selectionBox
            selectionBox.SurfaceTransparency = transparency * 1.3 + 0.25;
            selectionBox.Color3 = NONCOLLISION_COLOR;
            selectionBox.SurfaceColor3 = NONCOLLISION_COLOR;

        }
        else {
            hitbox.FindFirstChild("HitboxIndicator")?.Destroy();
        }

        const arrowsVisible = transparency < 0.7;
        for (const arrow of arrows) {
            arrow.Enabled = arrowsVisible;
        }
    };

    const buildModeConnection = Workspace.GetAttributeChangedSignal("BuildMode").Connect(update);
    model.GetAttributeChangedSignal("Dragging").Connect(update);
    model.GetAttributeChangedSignal("Hovering").Connect(update);
    model.Destroying.Once(destroy);
    loadedModels.add(model);
    update();
}

type Interactive = Instance & { Enabled: boolean; };

Workspace.GetAttributeChangedSignal("BuildMode").Connect(() => {
    for (const interactive of CollectionService.GetTagged("Interactive"))
        (interactive as Interactive).Enabled = !Workspace.GetAttribute("BuildMode") as boolean;
});
CollectionService.GetInstanceAddedSignal("Interactive").Connect((interactive) => {
    (interactive as Interactive).Enabled = !Workspace.GetAttribute("BuildMode") as boolean;
});