import Signal from "@antivivi/lemon-signal";
import { RunService, TweenService } from "@rbxts/services";
import { MOUSE } from "client/constants";
import Area from "shared/Area";
import { ASSETS, PLACED_ITEMS_FOLDER } from "shared/constants";
import Items from "shared/items/Items";
import ItemPlacement from "shared/utils/ItemPlacement";

const modeOptionsTween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
const targetsUpdated = new Signal<() => void>();
const acceptableColor = Color3.fromRGB(13, 105, 172);
const unacceptableColor = Color3.fromRGB(255, 51, 51);
const loadedModels = new Set<Model>();

let animationsEnabled = true;
let area: Area | undefined;
let selected: Model | undefined;

RunService.BindToRenderStep("Build Load", 1, () => {
    const placedItems = PLACED_ITEMS_FOLDER.GetChildren();
    for (const child of placedItems) {
        onModelAdded(child);
    }
});
script.GetActor()!.BindToMessage("Selecting", (newSelected: Model | undefined) => {
    selected = newSelected;
    targetsUpdated.fire();
});

function onModelAdded(model: Instance) {
    if (!model.IsA("Model") || loadedModels.has(model))
        return;
    const itemId = model.GetAttribute("ItemId") as string;
    const item = Items.getItem(itemId);
    if (item === undefined)
        throw "Model " + model.Name + " does not have item defined";

    const proximityPrompts = new Array<ProximityPrompt>();
    const isPlacing = model.GetAttribute("placing") === true;
    const hitbox = model.PrimaryPart;
    if (hitbox === undefined)
        return;
    const isConveyor = item.isA("Conveyor");
    const clickConnections = new Array<RBXScriptConnection>();
    const handlePrompt = (prompt?: ProximityPrompt) => {
        if (prompt !== undefined) {
            if (isPlacing)
                prompt.Destroy();
            else
                proximityPrompts.push(prompt);
        }
    };
    for (const c of model.GetChildren()) {
        const name = c.Name;
        if (c.IsA("BillboardGui") || (c.IsA("Beam") && !isConveyor) || c.IsA("SurfaceGui")) {
            if (isPlacing)
                c.Destroy();
        }
        else if (c.IsA("BasePart")) {
            if (name === "ClickArea" || name === "ButtonPart" || name === "Main" || name === "NPC")
                handlePrompt(c.FindFirstChildOfClass("ProximityPrompt"));
            if (isPlacing) {
                c.CanCollide = false;
                c.Transparency = 1 - ((1 - c.Transparency) / 2);
                c.CastShadow = false;
                continue;
            }
        }
        else if (c.IsA("Model")) {
            if (name === "Crank")
                handlePrompt(c.FindFirstChild("ButtonPart")?.FindFirstChildOfClass("ProximityPrompt"));
            else if (c.FindFirstChildOfClass("Humanoid") !== undefined && isPlacing) {
                const children = c.GetChildren();
                for (const child of children) {
                    if (child.IsA("BasePart"))
                        child.CanCollide = false;
                }
            }
        }
    }
    if (isPlacing === true) {
        if (area !== undefined && item.placeableAreas.includes(area)) {
            model.PivotTo(MOUSE.Hit);
        }
        if (item.isA("Charger")) {
            task.spawn(() => {
                const connectionVFX = model.WaitForChild("ConnectionVFX", 1);
                if (connectionVFX !== undefined) {
                    const color = (connectionVFX.FindFirstChild("w") as Beam | undefined)?.Color ?? new ColorSequence(new Color3());
                    const ring0 = ASSETS.ChargerRing.Clone();
                    const ring1 = ASSETS.ChargerRing.Clone();
                    const diameter = (item.radius ?? 0) * 2 + hitbox.Size.X;
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
                    connectionVFX.Destroy();
                }
            });
        }
    }

    const selectionBox = new Instance("SelectionBox");
    selectionBox.LineThickness = 0.05;
    selectionBox.Transparency = 1;
    selectionBox.Adornee = hitbox;

    const updateSelectionBox = () => {
        let transparency = 1;

        const selecting = model.GetAttribute("selecting");
        const color = (selecting === false || ItemPlacement.isItemModelAcceptable(model, item)) ? acceptableColor : unacceptableColor;
        if (selected !== undefined)
            transparency *= 0.7;
        if (model.GetAttribute("hovering") === true)
            transparency *= 0.5;
        if (selecting === true)
            transparency *= 0.3;

        const surfaceTransparency = transparency * 1.3 + 0.3;
        if (animationsEnabled) {
            TweenService.Create(selectionBox, modeOptionsTween,
                { Color3: color, SurfaceColor3: color, Transparency: transparency, SurfaceTransparency: surfaceTransparency }).Play();
        }
        else {
            selectionBox.Color3 = color;
            selectionBox.SurfaceColor3 = color;
            selectionBox.Transparency = transparency;
            selectionBox.SurfaceTransparency = surfaceTransparency;
        }
    };
    const destroy = () => {
        for (const clickConnection of clickConnections) {
            clickConnection.Disconnect();
        }
        if (buildModeToggleConnection !== undefined)
            buildModeToggleConnection.disconnect();
    };
    const update = () => {
        if (selected !== undefined) {
            hitbox.CanQuery = true;
            for (const proximityPrompt of proximityPrompts)
                proximityPrompt.Enabled = false;
        }
        else {
            hitbox.CanQuery = false;
            for (const proximityPrompt of proximityPrompts)
                proximityPrompt.Enabled = true;
        }
        updateSelectionBox();
    };

    hitbox.GetPropertyChangedSignal("CFrame").Connect(() => {
        updateSelectionBox();
    });
    const buildModeToggleConnection = targetsUpdated.connect(() => update());
    model.GetAttributeChangedSignal("hovering").Connect(() => update());
    model.GetAttributeChangedSignal("selecting").Connect(() => update());
    model.Destroying.Once(() => destroy());
    selectionBox.Adornee = hitbox;
    selectionBox.Parent = hitbox;
    loadedModels.add(model);
    update();
}