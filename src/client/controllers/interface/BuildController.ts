import { Controller, OnInit, OnPhysics } from "@flamework/core";
import { HttpService, TweenService, UserInputService } from "@rbxts/services";
import { BUILD_WINDOW, BuildOption, ITEM_MODELS, LOCAL_PLAYER, MOUSE } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { AREAS, ASSETS, PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import ItemPlacement from "shared/utils/ItemPlacement";
import { Fletchette, Signal } from "@antivivi/fletchette";
import { weldModel } from "shared/utils/vrldk/BasePartUtils";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");

@Controller()
export class BuildController implements OnInit, OnPhysics {
    modeOptionsTween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    moveTweenInfo = new TweenInfo(0.095, Enum.EasingStyle.Exponential);
    elapsed = 0;

    animationsEnabled = true;
    restricted = false;
    debounce = false;
    hovering = undefined as Model | undefined;
    selected = undefined as Model | undefined;
    rotation = new Instance("IntValue");
    targetsUpdated = new Signal<() => void>();
    hotkeys = new Map<string, Enum.KeyCode>();
    clickAreaColor = Color3.fromRGB(85, 255, 255);
    acceptableColor = Color3.fromRGB(13, 105, 172);
    unacceptableColor = Color3.fromRGB(255, 51, 51);
    cursorIcon = "rbxassetid://16375707867";
    placeTime = 0;

    constructor(private uiController: UIController, private hotkeysController: HotkeysController, private adaptiveTabController: AdaptiveTabController) {

    }

    hideBuildWindow() {
        return BUILD_WINDOW.Visible = false;
    }
    
    showBuildWindow() {
        return BUILD_WINDOW.Visible = true;
    }
    
    refreshButton(button: BuildOption) {
        if (this.selected !== undefined) {
            button.Visible = true;
            TweenService.Create(button.UIScale, this.modeOptionsTween, { Scale: 1 }).Play();
        }
        else {
            const tween = TweenService.Create(button.UIScale, this.modeOptionsTween, { Scale: 0 });
            tween.Play();
            task.delay(this.modeOptionsTween.Time, () => {
                if (button.UIScale.Scale === 0)
                    button.Visible = false;
            });
        }
    }
    
    refreshBuildWindow() {
        this.refreshButton(BUILD_WINDOW.Deselect);
        this.refreshButton(BUILD_WINDOW.Rotate);
        this.refreshButton(BUILD_WINDOW.Delete);
    }
    
    deletePlacingModel(except?: Model) {
        for (const m of PLACED_ITEMS_FOLDER.GetChildren()) {
            if (m.GetAttribute("placing") === true && except?.Name !== m.Name) {
                m.Destroy();
            }
        }
    }

    setSelected(model?: Model) {
        if (this.selected !== undefined)
            this.selected.SetAttribute("selecting", false);
        this.selected = model;
        if (model !== undefined)
            model.SetAttribute("selecting", true);
        this.deletePlacingModel(model);
        this.targetsUpdated.fire();
        return true;
    }

    placeNewItem(item: Item, originalPos?: Vector3, originalRot?: number) {
        this.deletePlacingModel();
        const itemModel = ITEM_MODELS.get(item.id)?.Clone();
        if (itemModel === undefined) {
            error("how");
        }
        itemModel.Name = "placing_" + HttpService.GenerateGUID(false);
        itemModel.SetAttribute("placing", true);
        itemModel.SetAttribute("ItemName", item.name);
        itemModel.SetAttribute("ItemId", item.id);
        itemModel.SetAttribute("OriginalPos", originalPos);
        itemModel.SetAttribute("Rotation", originalRot);
        itemModel.PivotTo(new CFrame(0, -1000, 0));
        weldModel(itemModel);
        itemModel.Parent = PLACED_ITEMS_FOLDER;
        this.setSelected(itemModel);
        this.adaptiveTabController.hideAdaptiveTab();
    }

    revertSelected() {
        const originalPos = this.selected?.GetAttribute("OriginalPos") as Vector3 | undefined;
        if (originalPos !== undefined) {
            ItemsCanister.placeItem.invoke(this.selected?.GetAttribute("ItemId") as string, originalPos, 
                (this.selected?.GetAttribute("Rotation") as number | undefined) ?? this.rotation.Value);
        }
    }

    placeSelected() {
        if (this.selected !== undefined) {
            const itemId = this.selected.GetAttribute("ItemId") as string | undefined;
            if (itemId === undefined)
                return false;
            const item = Items.getItem(itemId);
            if (item === undefined)
                return false;
            const [isAcceptable] = ItemPlacement.isItemModelAcceptable(this.selected, item.placeableAreas ?? []);
            if (!isAcceptable) {
                return false;
            }
            this.debounce = true;
            if (this.selected.GetAttribute("placing") === true) {
                const [success, amount] = ItemsCanister.placeItem.invoke(itemId, MOUSE.Hit.Position, this.rotation.Value);
                if (success && this.selected !== undefined) {
                    this.selected.Destroy();
                    if (amount !== undefined) {
                        if (amount > 0)
                            this.placeNewItem(item);
                        return true;
                    }
                }
                
            }
            else {
                ItemsCanister.moveItem.invoke(this.selected.Name, MOUSE.Hit.Position, this.rotation.Value);
                return true;
            }
            return false;
        }
    }

    onPhysics(dt: number) {
        const placedItems = PLACED_ITEMS_FOLDER.GetChildren();
        for (const child of placedItems) {
            this.onModelAdded(child);
        }
        if (this.debounce === true) {
            this.elapsed += dt;
            if (this.elapsed > 0.1) {
                this.debounce = false;
                this.elapsed = 0;
            }
            return;
        }
        if (this.selected !== undefined) {
            MOUSE.TargetFilter = PLACED_ITEMS_FOLDER;
            const pos = MOUSE.Hit;
            const pp = this.selected.PrimaryPart;
            const area = LOCAL_PLAYER.GetAttribute("Area") as keyof (typeof AREAS) | undefined;
            if (pp !== undefined && area !== undefined) {
                const buildBounds = AREAS[area].buildBounds;
                if (buildBounds === undefined) {
                    return;
                }
                const cframe = buildBounds.calcPlacementCFrame(this.selected, pos.Position, math.rad(this.rotation.Value), this.rotation.Value % 90 !== 0);
                if (this.animationsEnabled) {
                    TweenService.Create(pp, this.moveTweenInfo, {CFrame: cframe}).Play();
                }
                else {
                    pp.CFrame = cframe;
                }
            }
        }
        else {
            MOUSE.TargetFilter = undefined;
            let hovering = MOUSE.Target?.Parent;
            if (hovering === undefined || !hovering.IsA("Model") || hovering.Parent !== PLACED_ITEMS_FOLDER) {
                hovering = undefined;
            }
            if (this.hovering !== undefined && this.hovering !== hovering) {
                this.hovering.SetAttribute("hovering", false);
            }
            this.hovering = hovering;
            if (hovering !== undefined) {
                hovering.SetAttribute("hovering", true);
            }
        }
    }

    onModelAdded(model: Instance) {
        debug.profilebegin("BuildController Model Registering");
        if (!model.IsA("Model") || model.GetAttribute("handled") === true)
            return;
        const itemId = model.GetAttribute("ItemId") as string;
        const item = Items.getItem(itemId);
        if (item === undefined)
            error("Model " + model.Name + " does not have item defined");

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
        }
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
            model.PivotTo(MOUSE.Hit);
            if (item.isA("Charger")) {
                const connectionVFX = model.FindFirstChild("ConnectionVFX");
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
            }
        }
        const selectionBox = new Instance("SelectionBox");
        selectionBox.LineThickness = 0.05;
        selectionBox.Transparency = 1;
        selectionBox.Adornee = hitbox;
        
        const isWithinBounds = () => {
            const [acceptable, _area] = ItemPlacement.isItemModelAcceptable(model, item?.placeableAreas ?? []);
            return acceptable;
        }
        
        const updateSelectionBox = () => {
            const color = (isWithinBounds() || this.selected !== model) ? this.acceptableColor : this.unacceptableColor;
            if (this.animationsEnabled) {
                TweenService.Create(selectionBox, this.modeOptionsTween, { Color3: color, SurfaceColor3: color }).Play();
            }
            else {
                selectionBox.Color3 = color;
                selectionBox.SurfaceColor3 = color;
            }
        }
        const destroy = () => {
            if (this.selected === model)
                this.setSelected(undefined);
            for (const clickConnection of clickConnections) {
                clickConnection.Disconnect();
            }
            if (buildModeToggleConnection !== undefined)
                buildModeToggleConnection.disconnect();
        }
        const update = () => {
            let transparency = 1;
            
            if (this.selected !== undefined) {
                hitbox.CanQuery = true;
                transparency *= 0.7;
                for (const proximityPrompt of proximityPrompts)
                    proximityPrompt.Enabled = false;
            }
            else {
                hitbox.CanQuery = false;
                for (const proximityPrompt of proximityPrompts)
                    proximityPrompt.Enabled = true;
            }
            if (this.hovering === model)
                transparency *= 0.5;
            if (this.selected === model)
                transparency *= 0.3;
            updateSelectionBox();
            const surfaceTransparency = transparency * 1.3 + 0.3;
            if (this.animationsEnabled) {
                TweenService.Create(selectionBox, new TweenInfo(0.2), {Transparency: transparency, SurfaceTransparency: surfaceTransparency}).Play();
            }
            else {
                selectionBox.Transparency = transparency;
                selectionBox.SurfaceTransparency = surfaceTransparency;
            }
        }
        hitbox.GetPropertyChangedSignal("CFrame").Connect(() => {
            updateSelectionBox();
        });
        const buildModeToggleConnection = this.targetsUpdated.connect(() => update());
        model.GetAttributeChangedSignal("hovering").Connect(() => update());
        model.GetAttributeChangedSignal("selecting").Connect(() => update());
        model.Destroying.Once(() => destroy());
        selectionBox.Adornee = hitbox;
        selectionBox.Parent = hitbox;
        model.SetAttribute("handled", true);
        update();
        debug.profileend();
    }

    onInit() {
        const SettingsCanister = Fletchette.getCanister("SettingsCanister");
        SettingsCanister.settings.observe((value) => this.animationsEnabled = value.BuildAnimation);

        let lastTouch = 0;
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true)
                return;

            let isClicking = false;
            if (input.UserInputType === Enum.UserInputType.Touch)
                isClicking = tick() - lastTouch < 0.5;
            else
                isClicking = input.UserInputType === Enum.UserInputType.MouseButton1 || input.KeyCode === Enum.KeyCode.ButtonL1;

            lastTouch = tick();
            if (!isClicking)
                return;
                
            if (this.selected !== undefined) {
                this.uiController.playSound(this.placeSelected() ? "Place" : "Error");
            }
            else {
                const hovering = this.hovering;
                const target = MOUSE.Target;
                if (hovering === undefined || target === undefined || target.Name === "UpgradeActionsPart" || 
                    target.Name === "UpgradeOptionsPart" || target.FindFirstChildOfClass("ClickDetector") !== undefined)
                    return;
                const item = Items.getItem(hovering.GetAttribute("ItemId") as string);
                if (item === undefined)
                    return;
                this.uiController.playSound("Pickup");
                ItemsCanister.unplaceItems.fire([hovering.Name]);
                this.placeNewItem(item, hovering.PrimaryPart?.Position, (hovering.GetAttribute("Rotation") as number | undefined) ?? 0);
            }
        });

        for (const [_id, area] of pairs(AREAS)) {
            const texture = area.grid?.FindFirstChildOfClass("Texture");
            if (texture !== undefined) {
                this.targetsUpdated.connect(() => TweenService.Create(texture, this.modeOptionsTween, { Transparency: this.selected === undefined ? 1 : 0.8 }).Play());
            }
        }

        this.hotkeysController.setHotkey(BUILD_WINDOW.Deselect, Enum.KeyCode.Q, () => {
            if (this.selected === undefined || this.restricted === true)
                return false;
            this.revertSelected();
            this.setSelected(undefined);
            return true;
        }, "Deselect");
        this.hotkeysController.setHotkey(BUILD_WINDOW.Rotate, Enum.KeyCode.R, () => {
            if (this.selected !== undefined || this.restricted === true) {
                this.uiController.playSound("Woosh");
                if (this.rotation.Value >= 270) {
                    this.rotation.Value = 0;
                }
                else {
                    this.rotation.Value += 90;
                }
                return true;
            }
            return false;
        }, "Rotate");
        this.hotkeysController.setHotkey(BUILD_WINDOW.Delete, Enum.KeyCode.Delete, () => {
            if (this.selected === undefined || this.restricted === true)
                return false;
            this.uiController.playSound("Delete");
            this.setSelected(undefined);
            return true;
        }, "Unplace");

        let previouslyRestricted = false;
        const buildRestrictionsChanged = () => {
            const permLevel = LOCAL_PLAYER.GetAttribute("PermissionLevel") as number;
            if (permLevel === undefined) {
                return;
            }
            this.restricted = (permLevels.build ?? 0) > permLevel;
            if (this.restricted !== previouslyRestricted) {
                print('noo')
            }
            this.refreshBuildWindow();
            previouslyRestricted = this.restricted;
        }
        let permLevels: {[key: string]: number} = {};
        Fletchette.getCanister("PermissionsCanister").permLevels.observe((value) => {
            permLevels = value;
            buildRestrictionsChanged();
        });
        const onTargetsUpdated = () => {
            this.refreshBuildWindow();
        }
        onTargetsUpdated();
        this.targetsUpdated.connect(() => onTargetsUpdated());
        LOCAL_PLAYER.GetAttributeChangedSignal("PermissionLevel").Connect(() => buildRestrictionsChanged());
        buildRestrictionsChanged();
    }
}