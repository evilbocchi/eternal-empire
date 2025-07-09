import { weldModel } from "@antivivi/vrldk";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { Debris, HttpService, ReplicatedStorage, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, MOUSE, NONCOLLISION_COLOR } from "client/constants";
import HotkeysController from "client/controllers/HotkeysController";
import AdaptiveTabController from "client/controllers/interface/AdaptiveTabController";
import { SHOP_GUI } from "client/controllers/interface/ShopController";
import UIController, { INTERFACE } from "client/controllers/UIController";
import { AREAS } from "shared/Area";
import { getSound } from "shared/asset/GameAssets";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import BuildBounds from "shared/placement/BuildBounds";
import ItemPlacement from "shared/placement/ItemPlacement";
import Sandbox from "shared/Sandbox";

export type BuildOption = TextButton & {
    UIScale: UIScale,
    TextLabel: TextLabel,
    ImageLabel: ImageLabel;
};

export const BUILD_WINDOW = INTERFACE.WaitForChild("BuildWindow") as Frame & {
    Deselect: BuildOption,
    Options: Frame & {
        Rotate: BuildOption,
        Delete: BuildOption,
        Place: BuildOption;
    };
};

@Controller()
export default class BuildController implements OnInit, OnStart {

    /**
     * Offset of the selected models from the mouse.
     * The main selection has a blank identity CFrame.
     */
    readonly selected = new Map<Model, CFrame>();
    mainSelected: Model | undefined;

    rotationValue = new Instance("IntValue");

    /**
     * CFrame of the main model in {@link selected} before it was selected.
     */
    preselectCFrame: CFrame | undefined;

    /**
     * The model that is currently being hovered over by the player's mouse.
     */
    hovering: Model | undefined;

    clicking = false;
    multiselecting = false;

    baseplateBounds: BuildBounds | undefined;

    dragging = new Set<Model>();

    animationsEnabled = true;
    debounce = 0;
    readonly MOVETWEENINFO = new TweenInfo(0.25, Enum.EasingStyle.Back, Enum.EasingDirection.Out);
    readonly OPTIONSTWEENINFO = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    private lastRotate = 0;
    private lastMovedTo = 0;
    private lastMovedToCFrame = new CFrame();
    private lastSelectingCFrame = new CFrame();
    private lastCameraCFrame = new CFrame();

    constructor(private uiController: UIController, private hotkeysController: HotkeysController, private adaptiveTabController: AdaptiveTabController) {

    }

    /**
     * Whether the player is restricted from building.
     */
    getRestricted() {
        const buildLevel = LOCAL_PLAYER.GetAttribute("PermissionLevel") as number | undefined ?? 0;
        return (Packets.permLevels.get().build ?? 0) > buildLevel || SHOP_GUI.Enabled;
    }

    refresh() {
        let refreshButton: (button: BuildOption) => void;

        const isEmpty = this.selected.isEmpty();
        if (isEmpty || this.getRestricted() === true) {
            if (!isEmpty) {
                this.revertSelected();
                this.deselectAll(true);
            }
            this.preselectCFrame = undefined;
            this.mainSelected = undefined;
            this.setGridTransparency(1);

            refreshButton = (button: BuildOption) => {
                const tween = TweenService.Create(button.UIScale, this.OPTIONSTWEENINFO, { Scale: 0 });
                tween.Play();
                task.delay(this.OPTIONSTWEENINFO.Time, () => {
                    if (button.UIScale.Scale === 0) {
                        button.Visible = false;
                        BUILD_WINDOW.Visible = false;
                    }
                });
            };
            Workspace.SetAttribute("BuildMode", false);
        }
        else {
            this.setGridTransparency(0.8);
            BUILD_WINDOW.Visible = true;
            refreshButton = (button: BuildOption) => {
                button.Visible = true;
                TweenService.Create(button.UIScale, this.OPTIONSTWEENINFO, { Scale: 1 }).Play();
            };
            Workspace.SetAttribute("BuildMode", true);
        }

        refreshButton(BUILD_WINDOW.Deselect);
        refreshButton(BUILD_WINDOW.Options.Rotate);
        refreshButton(BUILD_WINDOW.Options.Delete);
        BUILD_WINDOW.Options.Place.Visible = UserInputService.TouchEnabled;
        refreshButton(BUILD_WINDOW.Options.Place);
    }

    /**
     * Updates hovering states of models.
     * 
     * @param model The model to set as hovering.
     */
    hover(model: Model | undefined) {
        const lastHovering = this.hovering;
        if (lastHovering !== undefined) {
            lastHovering.SetAttribute("Hovering", false);
        }
        if (model !== undefined) {
            if (this.selected.has(model)) // don't hover over selected models
                return;

            model.SetAttribute("Hovering", true);
        }
        this.hovering = model;
    }

    mainSelect(model: Model) {
        this.selected.set(model, new CFrame());
        this.preselectCFrame = model.PrimaryPart!.CFrame;
        this.mainSelected = model;
        this.rotationValue.Value = model.GetAttribute("InitialRotation") as number ?? 0;

        this.hover(undefined);
        model.SetAttribute("Selected", true);
        this.refresh();
        this.onMouseMove(true, false);
    }

    deselect(model: Model) {
        model.Destroy();
        this.selected.delete(model);
        this.refresh();
    }

    deselectAll(noRefresh?: boolean) {
        for (const [model] of this.selected)
            model.Destroy();
        this.selected.clear();
        if (noRefresh !== true)
            this.refresh();
    }

    setGridTransparency(transparency: number) {
        for (const [_id, area] of pairs(AREAS)) {
            const grid = area.getGrid();
            if (grid === undefined)
                continue;
            const texture = grid.FindFirstChildOfClass("Texture");
            if (texture === undefined)
                continue;
            TweenService.Create(texture, this.OPTIONSTWEENINFO, { Transparency: transparency }).Play();
        }
    }

    revertSelected() {
        const data = new Array<PlacingInfo>();
        for (const [selected] of this.selected) {
            const position = selected?.GetAttribute("InitialPosition") as Vector3 | undefined;
            if (position === undefined)
                continue;
            const rotation = selected?.GetAttribute("InitialRotation") as number | undefined;
            if (rotation === undefined)
                continue;

            data.push({ id: (selected.GetAttribute("UUID") ?? selected.GetAttribute("ItemId")) as string, position, rotation });
        }
        Packets.placeItems.invoke(data);
    }

    addPlacingModel(item: Item, uuid?: string, initialPosition?: Vector3, initialRotation?: number) {
        this.debounce = tick();
        const itemModel = item.MODEL?.Clone();
        if (itemModel === undefined)
            throw "how";

        itemModel.Name = "placing_" + HttpService.GenerateGUID(false);
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

    placeSelected() {
        const mainSelected = this.mainSelected;
        if (mainSelected === undefined)
            return false;

        const data = new Array<PlacingInfo>();
        let item: Item | undefined;

        const areaId = LOCAL_PLAYER.GetAttribute("Area") as AreaId | undefined;
        const baseplateBounds = this.baseplateBounds;
        const buildBounds = areaId === undefined ? baseplateBounds : AREAS[areaId].buildBounds;
        if (buildBounds === undefined)
            return;

        const grid = buildBounds.grid;
        if (grid === undefined)
            return;
        const gridRotation = grid.Orientation.Y;

        for (const [selected] of this.selected) {
            const itemId = selected.GetAttribute("ItemId") as string | undefined;
            if (itemId === undefined)
                return false;
            item = Items.getItem(itemId);
            if (item === undefined)
                return false;

            if (ItemPlacement.isTouchingPlacedItem(selected))
                return false;

            if (baseplateBounds === undefined && !ItemPlacement.isInPlaceableArea(selected, item))
                return false;

            const primaryPart = selected.PrimaryPart!;
            const indicator = primaryPart.FindFirstChild("Indicator") as BasePart;
            if (indicator === undefined)
                return false;
            let position = indicator.Position;

            // find the single number rotation from the CFrame
            const lookVector = primaryPart.CFrame.LookVector;
            let rotation = math.floor(math.deg(math.atan2(-lookVector.X, -lookVector.Z)) - gridRotation + 180); // angle of look vector in xz plane (0-360)
            rotation %= 360;

            const id = (selected.GetAttribute("UUID") as string | undefined) ?? item.id;

            data.push({ id, position, rotation });
        }
        this.debounce = tick();

        const status = Packets.placeItems.invoke(data);
        if (status === 0)
            return false;

        if (status === 1) {
            this.deselectAll();
        }
        for (const [selected] of this.selected) {
            selected.SetAttribute("InitialPosition", undefined);
            selected.SetAttribute("InitialRotation", undefined);
        }

        return true;
    }

    onMouseMove(changePos = true, animationsEnabled = this.animationsEnabled) {
        const size = this.selected.size();
        if (size === 0) { // nothing selected, perform hovering logic
            MOUSE.TargetFilter = undefined;
            const target = MOUSE.Target;
            if (target === undefined)
                return;

            let hovering = target.Parent;
            if (hovering === undefined ||
                !hovering.IsA("Model") ||
                hovering.Parent !== PLACED_ITEMS_FOLDER ||
                target.HasTag("Unhoverable") === true ||
                target.FindFirstChildOfClass("ClickDetector") !== undefined) {
                hovering = undefined;
            }

            if (hovering !== undefined && this.clicking === true) {
                this.dragging.add(hovering);
                hovering.SetAttribute("Dragging", true);
            }

            this.hover(hovering);
            return;
        }

        // something is selected, perform moving logic
        const areaId = LOCAL_PLAYER.GetAttribute("Area") as AreaId | undefined;
        const buildBounds = areaId === undefined ? this.baseplateBounds : AREAS[areaId].buildBounds;
        if (buildBounds === undefined)
            return;

        MOUSE.TargetFilter = PLACED_ITEMS_FOLDER;

        const mainSelected = this.mainSelected!;
        const rotation = this.rotationValue.Value;
        let cframe: CFrame | undefined;
        if (changePos === true) {
            cframe = MOUSE.Hit;
        }
        else {
            cframe = mainSelected.PrimaryPart!.CFrame;
        }

        cframe = buildBounds.snap(mainSelected.PrimaryPart!.Size, cframe.Position, math.rad(rotation), rotation % 90 !== 0);
        if (cframe === undefined || cframe.FuzzyEq(this.lastMovedToCFrame)) {
            return;
        }

        for (const [selected, offset] of this.selected) {
            const primaryPart = selected.PrimaryPart;
            if (primaryPart === undefined)
                continue;
            const indicator = primaryPart.FindFirstChild("Indicator");
            if (indicator === undefined)
                continue;

            const relative = cframe.mul(offset);
            (indicator as BasePart).CFrame = relative;

            if (animationsEnabled === true)
                TweenService.Create(primaryPart, this.MOVETWEENINFO, { CFrame: relative }).Play();
            else
                primaryPart.CFrame = relative;
        }
        const lastSound = tick() - this.lastMovedTo;
        if (lastSound > 0.05) {
            const moveSound = getSound("ItemMove.mp3").Clone();
            const pitchDecrement = math.min(lastSound, 0.5) * 0.5;
            this.lastMovedTo = tick();
            moveSound.PlaybackSpeed = 1 + 0.5 - pitchDecrement;
            moveSound.Volume = 0.35;
            moveSound.Parent = ReplicatedStorage;
            moveSound.Play();
            Debris.AddItem(moveSound, 1.5);
        }
        this.lastMovedToCFrame = cframe;
    }

    onMouseDown() {
        if (this.getRestricted() === true)
            return;

        this.clicking = true;

        const cameraCFrame = Workspace.CurrentCamera?.CFrame ?? new CFrame();
        if (UserInputService.TouchEnabled && !this.lastCameraCFrame.FuzzyEq(cameraCFrame)) {
            this.onMouseMove();
        }
        this.lastCameraCFrame = cameraCFrame;
    }

    onMouseUp(useCurrentPos?: boolean) {
        if (this.getRestricted() === true)
            return;

        this.clicking = false;

        const size = this.selected.size();
        if (size === 0) { // nothing selected, handle dragging
            const hovering = this.hovering;
            const dragging = this.dragging;
            if (hovering !== undefined) {
                this.uiController.playSound("Pickup.mp3");
                const names = new Array<string>();
                for (const model of dragging) {
                    names.push(model.Name);
                    const placingModel = this.addPlacingModel(
                        Items.getItem(model.GetAttribute("ItemId") as string)!,
                        model.GetAttribute("UUID") as string | undefined,
                        model.PrimaryPart?.Position,
                        (model.GetAttribute("Rotation") as number | undefined) ?? 0
                    );
                    if (model === hovering) {
                        this.mainSelect(placingModel);
                    }
                    else {
                        this.selected.set(placingModel, hovering.PrimaryPart!.CFrame.Inverse().mul(model.PrimaryPart!.CFrame));
                    }
                }
                Packets.unplaceItems.inform(names);
                this.onMouseMove(true, false);
            }

            for (const model of dragging)
                model.SetAttribute("Dragging", false);
            dragging.clear();
            return;
        }

        const selectingCFrame = (this.mainSelected!.PrimaryPart!.FindFirstChild("Indicator") as BasePart).CFrame;
        if (UserInputService.TouchEnabled === false || useCurrentPos === true || this.lastSelectingCFrame === selectingCFrame) {
            for (const [selected] of this.selected) {
                const primaryPart = selected.PrimaryPart;
                if (primaryPart === undefined)
                    continue;
                const indicator = primaryPart.FindFirstChild("Indicator") as BasePart;
                if (indicator === undefined)
                    continue;
                primaryPart.CFrame = indicator.CFrame; // snap to indicator
            }
            if (this.placeSelected() === true) {
                this.uiController.playSound("Place.mp3", 0.7);
            }
            else {
                this.uiController.playSound("Error.mp3");
            }
            this.lastSelectingCFrame = selectingCFrame;
            return;
        }
        this.lastSelectingCFrame = selectingCFrame;
    }

    onInit() {
        Packets.settings.observe((value) => this.animationsEnabled = value.BuildAnimation);

        Workspace.CurrentCamera?.GetPropertyChangedSignal("CFrame").Connect(() => {
            if (UserInputService.TouchEnabled === true && !this.selected.isEmpty())
                return;
            this.onMouseMove();
        });

        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true)
                return;

            if (input.UserInputType === Enum.UserInputType.Touch || input.UserInputType === Enum.UserInputType.MouseButton1 || input.KeyCode === Enum.KeyCode.ButtonL1) {
                this.onMouseDown();
                if (this.selected.isEmpty()) {
                    this.onMouseMove();
                }
            }
        });
        UserInputService.TouchEnded.Connect((_touch, gameProcessed) => {
            if (gameProcessed === true)
                return;
            this.onMouseUp();
        });

        UserInputService.InputChanged.Connect((input, gameProcessed) => {
            if (gameProcessed === true)
                return;
            if (input.UserInputType === Enum.UserInputType.MouseMovement) {
                this.onMouseMove();
            }
        });
        UserInputService.InputEnded.Connect((input, gameProcessed) => {
            if (gameProcessed === true)
                return;

            if (input.UserInputType !== Enum.UserInputType.MouseButton1 && input.KeyCode !== Enum.KeyCode.ButtonL1)
                return;

            this.onMouseUp();
        });

        this.hotkeysController.setHotkey(BUILD_WINDOW.Deselect, Enum.KeyCode.Q, () => {
            if (this.selected.isEmpty() || this.getRestricted() === true)
                return false;
            this.revertSelected();
            this.deselectAll();
            return true;
        }, "Deselect");
        this.hotkeysController.setHotkey(BUILD_WINDOW.Options.Rotate, Enum.KeyCode.R, () => {
            if (!this.selected.isEmpty() || this.getRestricted() === true) {
                const rotateSound = getSound("ItemRotate.mp3").Clone();
                const pitchDecrement = math.min(tick() - this.lastRotate, 0.5) * 0.25;
                rotateSound.PlaybackSpeed = 1 + 0.25 - pitchDecrement;
                rotateSound.Parent = ReplicatedStorage;
                rotateSound.Play();
                Debris.AddItem(rotateSound, 1.5);
                this.lastRotate = tick();

                if (this.rotationValue.Value >= 270) {
                    this.rotationValue.Value = 0;
                }
                else {
                    this.rotationValue.Value += 90;
                }
                this.onMouseMove(!UserInputService.TouchEnabled);
                return true;
            }
            return false;
        }, "Rotate");
        this.hotkeysController.setHotkey(BUILD_WINDOW.Options.Delete, Enum.KeyCode.Delete, () => {
            if (this.selected.isEmpty() || this.getRestricted() === true)
                return false;
            this.uiController.playSound("Unplace.mp3");
            this.deselectAll();
            return true;
        }, "Unplace");
        this.hotkeysController.setHotkey(BUILD_WINDOW.Options.Place, undefined, () => {
            if (this.selected.isEmpty() || this.getRestricted() === true)
                return false;

            this.onMouseUp(true);
            return true;
        }, "Place");


        this.hotkeysController.bindKey(Enum.KeyCode.LeftShift, () => {
            this.multiselecting = true;
            return true;
        }, 1, "Multiselect", undefined, () => {
            this.multiselecting = false;
            return true;
        });

        Packets.permLevels.observe(() => this.refresh());
        LOCAL_PLAYER.GetAttributeChangedSignal("PermissionLevel").Connect(() => this.refresh());
        SHOP_GUI.GetPropertyChangedSignal("Enabled").Connect(() => this.refresh());

        PLACED_ITEMS_FOLDER.ChildRemoved.Connect((model) => {
            if (model.IsA("Model") && this.selected.has(model)) {
                this.deselect(model);
            }
        });
    }

    onStart() {
        if (Sandbox.getEnabled()) {
            this.baseplateBounds = Sandbox.createBaseplateBounds();
        }
    }
}