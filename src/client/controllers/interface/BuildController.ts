import { Controller, OnInit } from "@flamework/core";
import { HttpService, RunService, TweenService, UserInputService, Workspace } from "@rbxts/services";
import Signal from "@rbxutil/signal";
import { BUILD_WINDOW, LOCAL_PLAYER, MOUSE } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { ItemModelController } from "client/controllers/ItemModelController";
import { UIController } from "client/controllers/UIController";
import { AREAS } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import ItemPlacement from "shared/utils/ItemPlacement";
import { Fletchette } from "shared/utils/fletchette";
import { weldModel } from "shared/utils/vrldk/BasePartUtils";
import { AdaptiveTabController } from "./AdaptiveTabController";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");

@Controller()
export class BuildController implements OnInit {
    buildModeToggled = new Signal<boolean>();
    buildModeEnabled = false;
    modeOptionsTween1 = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    modeOptionsTween2 = new TweenInfo(0.2, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    placedItemsFolder = Workspace.WaitForChild("PlacedItems");

    debounce = false;
    hovering = undefined as Model | undefined;
    selected = undefined as Model | undefined;
    rotation = new Instance("IntValue");
    targetsUpdated = new Signal<void>();
    hotkeys = new Map<string, Enum.KeyCode>();

    constructor(private uiController: UIController, private hotkeysController: HotkeysController, 
        private itemModelController: ItemModelController, private adaptiveTabController: AdaptiveTabController) {

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
        BUILD_WINDOW.ModeLabel.Text = "Build Mode: " + (this.buildModeEnabled ? "Enabled" : "Disabled");
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
        BUILD_WINDOW.PlacementLabel.Visible = enabled;
        TweenService.Create(BUILD_WINDOW.ModeOptions.UIListLayout, this.modeOptionsTween1, { Padding: enabled ? new UDim(0, 10) : new UDim(0, 0) }).Play();
        TweenService.Create(BUILD_WINDOW.ModeOptions.Dropdown.ImageLabel, this.modeOptionsTween2, { Rotation: enabled ? 180 : 0 }).Play();
        this.buildModeEnabled = enabled;
        this.buildModeToggled.Fire(enabled);
        this.refreshBuildWindow();
        return true;
    }
    
    deletePlacingModel(except?: Model) {
        for (const m of this.placedItemsFolder.GetChildren()) {
            if (m.GetAttribute("placing") === true && except?.Name !== m.Name) {
                m.Destroy();
            }
        }
    }

    setSelected(model?: Model) {
        this.selected = model;
        this.deletePlacingModel(model);
        if (model === undefined) {
            BUILD_WINDOW.PlacementLabel.Text = "Nothing selected.";
        }
        else {
            BUILD_WINDOW.PlacementLabel.Text = "Selecting: " + model.GetAttribute("ItemName") as string + ". Click to place.";
        }
        this.targetsUpdated.Fire();
        return true;
    }

    setHover(model?: Model) {
        this.hovering = model;
        this.targetsUpdated.Fire();
    }

    placeNewItem(item: Item, originalPos?: Vector3, originalRot?: number) {
        this.deletePlacingModel();
        this.setBuildModeEnabled(true);
        const itemModel = this.itemModelController.getItemModel(item.id).Clone();
        if (itemModel === undefined) {
            error("how");
        }
        itemModel.Name = "placing_" + HttpService.GenerateGUID(false);
        itemModel.SetAttribute("placing", true);
        itemModel.SetAttribute("ItemName", item.getName());
        itemModel.SetAttribute("ItemId", item.id);
        itemModel.SetAttribute("OriginalPos", originalPos);
        itemModel.SetAttribute("Rotation", originalRot);
        itemModel.PivotTo(MOUSE.Hit);
        weldModel(itemModel);
        itemModel.Parent = this.placedItemsFolder;
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
                return;
            const item = Items.getItem(itemId);
            if (item === undefined)
                return;
            if (!ItemPlacement.isItemModelAcceptable(this.selected, item.getPlaceableAreas() ?? [])) {
                this.uiController.playSound("Error");
                return;
            }
            if (this.selected.GetAttribute("placing") === true) {
                const [success, amount] = ItemsCanister.placeItem.invoke(itemId, MOUSE.Hit.Position, this.rotation.Value)
                if (success && this.selected !== undefined) {
                    this.uiController.playSound("Place");
                    this.selected.Destroy();
                    if (amount !== undefined) {
                        if (amount > 0)
                            this.placeNewItem(item);
                        return;
                    }
                }
                this.debounce = true;
            }
            else {
                const [success, _amount] = ItemsCanister.moveItem.invoke(this.selected.Name, MOUSE.Hit.Position, this.rotation.Value)
                if (success) {
                    this.uiController.playSound("Place");
                    this.setSelected(undefined);
                }
            }
        }
    }

    onInit() {
        let elapsed = 0;
        const moveTweenInfo = new TweenInfo(0.15, Enum.EasingStyle.Quint);
        RunService.Heartbeat.Connect((dt) => {
            if (this.debounce === true) {
                elapsed += dt;
                if (elapsed > 0.1) {
                    this.debounce = false;
                    elapsed = 0;
                }
            }
            if (this.selected !== undefined) {
                MOUSE.TargetFilter = this.placedItemsFolder;
                const pos = MOUSE.Hit;
                const pp = this.selected.PrimaryPart;
                const area = LOCAL_PLAYER.GetAttribute("Area") as keyof (typeof AREAS) | undefined;
                if (pp !== undefined && area !== undefined) {
                    TweenService.Create(pp, moveTweenInfo, {CFrame: AREAS[area].getBuildBounds()
                        .calcPlacementCFrame(this.selected, pos.Position, math.rad(this.rotation.Value), this.rotation.Value % 90 !== 0)}).Play();
                }
            }
        });

        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed)
                return;
            if (input.UserInputType === Enum.UserInputType.MouseButton1 || input.UserInputType === Enum.UserInputType.Touch || input.KeyCode === Enum.KeyCode.ButtonL1) {
                this.placeSelected();
            }
        })

        const onModelAdded = (model: Instance) => {
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
            for (const c of model.GetDescendants()) {
                if (c.IsA("BasePart") && isPlacing) {
                    c.CanCollide = false;
                    c.Transparency += 0.5;
                    c.CastShadow = false;
                }
                else if (c.IsA("ProximityPrompt")) {
                    if (isPlacing)
                        c.Destroy();
                    else
                        proximityPrompts.push(c);
                }
                else if (c.IsA("BillboardGui") || c.IsA("Beam")) {
                    if (isPlacing)
                        c.Destroy();
                }
                else if (c.IsA("BasePart")) {
                    const clickDetector = new Instance("ClickDetector");
                    clickDetector.CursorIcon = "rbxassetid://16375707867";
                    clickDetector.MouseHoverEnter.Connect(() => this.setHover(model));
                    clickDetector.MouseHoverLeave.Connect(() => this.setHover());
                    const clickConnection = clickDetector.MouseClick.Connect(() => {
                        if (this.selected === undefined && this.debounce === false) {
                            this.uiController.playSound("Pickup");
                            ItemsCanister.unplaceItem.invoke(model.Name);
                            this.placeNewItem(item, hitbox.Position, (model.GetAttribute("Rotation") as number | undefined) ?? 0);
                        }
                    });
                    model.Destroying.Once(() => {
                        buildModeToggleConnection.Disconnect();
                        clickConnection.Disconnect();
                    });
                    const cPart = c.Clone();
                    cPart.Size = cPart.Size.add(new Vector3(0.1, 0.1, 0.1));
                    cPart.Transparency = 1;
                    cPart.Name = "cpart";
                    cPart.CanCollide = false;
                    cPart.CanTouch = false;
                    cPart.Parent = c.Parent;
                    for (const a of cPart.GetDescendants()) {
                        if (!a.IsA("BasePart"))
                            a.Destroy();
                    }
                    const onBuildModeChanged = (enabled: boolean) => {
                        clickDetector.MaxActivationDistance = enabled ? 32 : 0;
                        cPart.CanQuery = enabled;
                    }
                    const buildModeToggleConnection = this.buildModeToggled.Connect((enabled) => onBuildModeChanged(enabled));
                    onBuildModeChanged(this.buildModeEnabled);
                    clickDetector.Parent = cPart;
                }
            }
            const selectionBox = new Instance("SelectionBox");
            selectionBox.LineThickness = 0.05;
            selectionBox.Transparency = 1;
            selectionBox.Adornee = hitbox;
            
            const isWithinBounds = () => {
                const [acceptable, _area] = ItemPlacement.isItemModelAcceptable(model, item?.getPlaceableAreas() ?? []);
                return acceptable;
            }
            
            const updateSelectionBox = () => {
                const color = (isWithinBounds() || this.selected !== model) ? Color3.fromRGB(13, 105, 172) : Color3.fromRGB(255, 51, 51);
                TweenService.Create(selectionBox, this.modeOptionsTween1, { Color3: color, SurfaceColor3: color }).Play();
            }
            const destroy = () => {
                if (this.selected === model)
                    this.setSelected(undefined);
                if (targetsUpdatedConnection !== undefined)
                    targetsUpdatedConnection.Disconnect();
                if (buildModeToggleConnection !== undefined)
                    buildModeToggleConnection.Disconnect();
            }
            const update = () => {
                for (const p of proximityPrompts)
                    p.Enabled = !this.buildModeEnabled;
                let transparency = this.buildModeEnabled ? 0.8 : 2;
                if (this.hovering === model)
                    transparency *= 0.5;
                if (this.selected === model) {
                    transparency *= 0.3;
                }
                hitbox.CanQuery = this.buildModeEnabled;
                updateSelectionBox();
                TweenService.Create(selectionBox, new TweenInfo(0.2), {Transparency: transparency, SurfaceTransparency: transparency * 1.3 + 0.3}).Play();
            }
            hitbox.GetPropertyChangedSignal("CFrame").Connect(() => {
                BUILD_WINDOW.PlacementLabel.Visible = true;
                updateSelectionBox();
            });
            const buildModeToggleConnection = this.buildModeToggled.Connect(() => update());
            const targetsUpdatedConnection = this.targetsUpdated.Connect(() => update());
            model.Destroying.Once(() => destroy());
            selectionBox.Adornee = hitbox;
            selectionBox.Parent = hitbox;
            model.SetAttribute("handled", true);
            update();
        }
        task.spawn(() => {
            while (task.wait(2)) {
                for (const child of this.placedItemsFolder.GetChildren()) {
                    onModelAdded(child);
                }
            }
        });
        this.placedItemsFolder.ChildAdded.Connect((child) => onModelAdded(child));

        for (const [_id, area] of pairs(AREAS)) {
            const texture = area.grid.FindFirstChildOfClass("Texture");
            if (texture !== undefined) {
                this.buildModeToggled.Connect((e) => {
                    TweenService.Create(texture, this.modeOptionsTween1, { Transparency: e ? 0.8 : 1 }).Play();
                });
            }
        }

        this.hotkeysController.setHotkey(BUILD_WINDOW.ModeOptions.Deselect, Enum.KeyCode.Q, () => {
            if (this.selected === undefined)
                return false;
            this.revertSelected();
            this.setSelected(undefined);
            return true;
        }, "Deselect");
        this.hotkeysController.setHotkey(BUILD_WINDOW.ModeOptions.Place, Enum.KeyCode.P, () => {
            if (this.selected === undefined)
                return false;
            this.placeSelected();
            return true;
        }, "Place");
        this.hotkeysController.setHotkey(BUILD_WINDOW.ModeOptions.Rotate, Enum.KeyCode.R, () => {
            if (this.selected !== undefined) {
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
            if (this.selected === undefined)
                return false;
            this.uiController.playSound("Delete");
            this.setSelected(undefined);
            return true;
        }, "Unplace");
        this.hotkeysController.setHotkey(BUILD_WINDOW.ModeOptions.Dropdown, Enum.KeyCode.B, () => this.setBuildModeEnabled(!this.buildModeEnabled), "Toggle Build");


        this.setBuildModeEnabled(false);
    }
}