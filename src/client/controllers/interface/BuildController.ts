import { Controller, OnInit } from "@flamework/core";
import { HttpService, RunService, TweenService, UserInputService } from "@rbxts/services";
import { BUILD_WINDOW, ITEM_MODELS, LOCAL_PLAYER, MOUSE } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { AREAS, PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import ItemPlacement from "shared/utils/ItemPlacement";
import { Fletchette, Signal } from "shared/utils/fletchette";
import { weldModel } from "shared/utils/vrldk/BasePartUtils";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");

@Controller()
export class BuildController implements OnInit {
    buildModeToggled = new Signal<(enabled: boolean) => void>();
    buildModeEnabled = false;
    modeOptionsTween1 = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    modeOptionsTween2 = new TweenInfo(0.2, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);

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

    constructor(private uiController: UIController, private hotkeysController: HotkeysController) {

    }

    hideBuildWindow() {
        return BUILD_WINDOW.Visible = false;
    }
    
    showBuildWindow() {
        return BUILD_WINDOW.Visible = true;
    }
    
    refreshButton(button: TextButton) {
        if (this.buildModeEnabled) {
            button.Visible = true;
            TweenService.Create(button, this.modeOptionsTween1, { Size: new UDim2(1, 0, 1, 0) }).Play();
        }
        else {
            TweenService.Create(button, this.modeOptionsTween1, { Size: new UDim2(0, 0, 0, 0) }).Play();
            task.delay(0.5, () => {
                if (button.Size === new UDim2(0, 0, 0, 0)) {
                    button.Visible = false;
                }
            });
        }
    }
    
    refreshBuildWindow() {
        BUILD_WINDOW.ModeLabel.Text = "Build Mode: " + (this.restricted ? "Restricted" : (this.buildModeEnabled ? "Enabled" : "Disabled"));
        this.refreshButton(BUILD_WINDOW.ModeOptions.Deselect);
        this.refreshButton(BUILD_WINDOW.ModeOptions.Place);
        this.refreshButton(BUILD_WINDOW.ModeOptions.Rotate);
        this.refreshButton(BUILD_WINDOW.ModeOptions.Delete);
    }

    setBuildModeEnabled(enabled: boolean) {
        this.uiController.playSound("Flip");
        if (enabled === false) {
            this.revertSelected();
        }
        this.setSelected(undefined);
        BUILD_WINDOW.PlacementLabel.Visible = enabled || this.restricted;
        TweenService.Create(BUILD_WINDOW.ModeOptions.UIListLayout, this.modeOptionsTween1, { Padding: enabled ? new UDim(0, 10) : new UDim(0, 0) }).Play();
        TweenService.Create(BUILD_WINDOW.ModeOptions.Dropdown.ImageLabel, this.modeOptionsTween2, { Rotation: enabled ? 180 : 0 }).Play();
        this.buildModeEnabled = enabled;
        this.buildModeToggled.fire(enabled);
        this.refreshBuildWindow();
        return true;
    }
    
    deletePlacingModel(except?: Model) {
        for (const m of PLACED_ITEMS_FOLDER.GetChildren()) {
            if (m.GetAttribute("placing") === true && except?.Name !== m.Name) {
                m.Destroy();
            }
        }
    }

    setSelected(model?: Model) {
        this.selected = model;
        this.deletePlacingModel(model);
        if (this.restricted === true) {
            BUILD_WINDOW.PlacementLabel.Text = "You are not allowed to build.";
        }
        else if (model === undefined) {
            BUILD_WINDOW.PlacementLabel.Text = "Nothing selected.";
        }
        else {
            BUILD_WINDOW.PlacementLabel.Text = "Selecting: " + model.GetAttribute("ItemName") as string + ". Click to place.";
        }
        this.targetsUpdated.fire();
        return true;
    }

    setHover(model?: Model) {
        this.hovering = model;
        this.targetsUpdated.fire();
    }

    placeNewItem(item: Item, originalPos?: Vector3, originalRot?: number) {
        this.deletePlacingModel();
        this.setBuildModeEnabled(true);
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
        itemModel.PivotTo(MOUSE.Hit);
        weldModel(itemModel);
        itemModel.Parent = PLACED_ITEMS_FOLDER;
        this.setSelected(itemModel);
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

    onInit() {
        const SettingsCanister = Fletchette.getCanister("SettingsCanister");
        SettingsCanister.settings.observe((value) => this.animationsEnabled = value.BuildAnimation);

        let elapsed = 0;
        const moveTweenInfo = new TweenInfo(0.125, Enum.EasingStyle.Quint);
        RunService.Heartbeat.Connect((dt) => {
            if (this.debounce === true) {
                elapsed += dt;
                if (elapsed > 0.1) {
                    this.debounce = false;
                    elapsed = 0;
                }
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
                        TweenService.Create(pp, moveTweenInfo, {CFrame: cframe}).Play();
                    }
                    else {
                        pp.CFrame = cframe;
                    }
                }
            }
        });

        let lastTouch = 0;
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed)
                return;
            if (this.selected !== undefined) {
                if (input.UserInputType === Enum.UserInputType.MouseButton1 || input.KeyCode === Enum.KeyCode.ButtonL1) {
                    this.uiController.playSound(this.placeSelected() ? "Place" : "Error");
                }
                else if (input.UserInputType === Enum.UserInputType.Touch) {
                    if (tick() - lastTouch < 0.5) {
                        this.uiController.playSound(this.placeSelected() ? "Place" : "Error");
                    }
                    lastTouch = tick();
                }
            }
        });

        const onModelAdded = (model: Instance) => {
            const placeTime = tick();
            if (!model.IsA("Model") || model.GetAttribute("handled") === true)
                return;
            const itemId = model.GetAttribute("ItemId") as string;
            const item = Items.getItem(itemId);
            if (item === undefined)
                error("Model " + model.Name + " does not have item defined");

            const proximityPrompts: ProximityPrompt[] = [];
            const isPlacing = model.GetAttribute("placing") === true;
            const hitbox = model.PrimaryPart;
            if (hitbox === undefined)
                return;
            const isConveyor = item.isA("Conveyor");
            for (const c of model.GetChildren()) {
                if (c.IsA("BillboardGui") || (c.IsA("Beam") && !isConveyor) || c.IsA("SurfaceGui")) {
                    if (isPlacing)
                        c.Destroy();
                }
                else if (c.IsA("BasePart")) {
                    if (c.Name === "ButtonPart" || c.Name === "Main" || c.Name === "NPC") {
                        const prompt = c.FindFirstChildOfClass("ProximityPrompt");
                        if (prompt !== undefined) {
                            if (isPlacing)
                                prompt.Destroy();
                            else
                                proximityPrompts.push(prompt);
                        }
                    }
                    if (isPlacing) {
                        c.CanCollide = false;
                        c.Transparency += 0.5;
                        c.CastShadow = false;
                        continue;
                    }
                    const clickDetector = new Instance("ClickDetector");
                    clickDetector.CursorIcon = this.cursorIcon;
                    clickDetector.MouseHoverEnter.Connect(() => this.setHover(model));
                    clickDetector.MouseHoverLeave.Connect(() => this.setHover());
                    const clickConnection = clickDetector.MouseClick.Connect(() => {
                        if (this.selected === undefined && this.debounce === false) {
                            if (tick() - placeTime < 0.5) {
                                return;
                            }
                            this.uiController.playSound("Pickup");
                            ItemsCanister.unplaceItems.fire([model.Name]);
                            this.placeNewItem(item, hitbox.Position, (model.GetAttribute("Rotation") as number | undefined) ?? 0);
                        }
                    });
                    model.Destroying.Once(() => {
                        buildModeToggleConnection.disconnect();
                        clickConnection.Disconnect();
                    });
                    const cPart = c.Clone();
                    cPart.Size = cPart.Size.add(new Vector3(0.1, 0.1, 0.1));
                    cPart.Transparency = 1;
                    cPart.Name = "cpart";
                    cPart.CanCollide = false;
                    cPart.CanTouch = false;
                    cPart.Parent = c.Parent;
                    for (const a of cPart.GetChildren()) {
                        if (!a.IsA("BasePart"))
                            a.Destroy();
                    }
                    const onBuildModeChanged = (enabled: boolean) => {
                        clickDetector.MaxActivationDistance = enabled ? 32 : 0;
                        cPart.CanQuery = enabled;
                    }
                    const buildModeToggleConnection = this.buildModeToggled.connect((enabled) => onBuildModeChanged(enabled));
                    onBuildModeChanged(this.buildModeEnabled);
                    clickDetector.Parent = cPart;
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
                    TweenService.Create(selectionBox, this.modeOptionsTween1, { Color3: color, SurfaceColor3: color }).Play();
                }
                else {
                    selectionBox.Color3 = color;
                    selectionBox.SurfaceColor3 = color;
                }
            }
            const destroy = () => {
                if (this.selected === model)
                    this.setSelected(undefined);
                if (targetsUpdatedConnection !== undefined)
                    targetsUpdatedConnection.disconnect();
                if (buildModeToggleConnection !== undefined)
                    buildModeToggleConnection.disconnect();
            }
            const update = () => {
                const enabled = this.buildModeEnabled && LOCAL_PLAYER.GetAttribute("Area") === model.GetAttribute("Area");
                for (const p of proximityPrompts)
                    p.Enabled = !enabled;
                let transparency = enabled ? 0.8 : 2;
                if (this.hovering === model)
                    transparency *= 0.5;
                if (this.selected === model) {
                    transparency *= 0.3;
                }
                hitbox.CanQuery = enabled;
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
                BUILD_WINDOW.PlacementLabel.Visible = true;
                updateSelectionBox();
            });
            const buildModeToggleConnection = this.buildModeToggled.connect(() => update());
            const targetsUpdatedConnection = this.targetsUpdated.connect(() => update());
            model.Destroying.Once(() => destroy());
            selectionBox.Adornee = hitbox;
            selectionBox.Parent = hitbox;
            model.SetAttribute("handled", true);
            update();
        }
        task.spawn(() => {
            while (task.wait(2)) {
                for (const child of PLACED_ITEMS_FOLDER.GetChildren()) {
                    onModelAdded(child);
                }
            }
        });
        PLACED_ITEMS_FOLDER.ChildAdded.Connect((child) => onModelAdded(child));

        for (const [_id, area] of pairs(AREAS)) {
            const texture = area.grid?.FindFirstChildOfClass("Texture");
            if (texture !== undefined) {
                this.buildModeToggled.connect((e) => {
                    TweenService.Create(texture, this.modeOptionsTween1, { Transparency: e ? 0.8 : 1 }).Play();
                });
            }
        }

        this.hotkeysController.setHotkey(BUILD_WINDOW.ModeOptions.Deselect, Enum.KeyCode.Q, () => {
            if (this.selected === undefined || this.restricted === true)
                return false;
            this.revertSelected();
            this.setSelected(undefined);
            return true;
        }, "Deselect");
        this.hotkeysController.setHotkey(BUILD_WINDOW.ModeOptions.Place, Enum.KeyCode.P, () => {
            if (this.selected === undefined || this.restricted === true)
                return false;
            this.placeSelected();
            return true;
        }, "Place");
        this.hotkeysController.setHotkey(BUILD_WINDOW.ModeOptions.Rotate, Enum.KeyCode.R, () => {
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
        this.hotkeysController.setHotkey(BUILD_WINDOW.ModeOptions.Delete, Enum.KeyCode.Delete, () => {
            if (this.selected === undefined || this.restricted === true)
                return false;
            this.uiController.playSound("Delete");
            this.setSelected(undefined);
            return true;
        }, "Unplace");
        this.hotkeysController.setHotkey(BUILD_WINDOW.ModeOptions.Dropdown, Enum.KeyCode.B, () => {
            if (this.restricted === true) {
                return false;
            }
            return this.setBuildModeEnabled(!this.buildModeEnabled);
        }, "Toggle Build");

        let previouslyRestricted = false;
        const buildRestrictionsChanged = () => {
            const permLevel = LOCAL_PLAYER.GetAttribute("PermissionLevel") as number;
            if (permLevel === undefined) {
                return;
            }
            this.restricted = (permLevels.build ?? 0) > permLevel;
            if (this.restricted !== previouslyRestricted) {
                this.setBuildModeEnabled(false);
            }
            this.refreshBuildWindow();
            previouslyRestricted = this.restricted;
        }
        let permLevels: {[key: string]: number} = {};
        Fletchette.getCanister("PermissionsCanister").permLevels.observe((value) => {
            permLevels = value;
            buildRestrictionsChanged();
        });
        LOCAL_PLAYER.GetAttributeChangedSignal("PermissionLevel").Connect(() => buildRestrictionsChanged());
        buildRestrictionsChanged();
        this.setBuildModeEnabled(false);
    }
}