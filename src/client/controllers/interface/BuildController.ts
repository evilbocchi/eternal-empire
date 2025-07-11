import Signal from "@antivivi/lemon-signal";
import { Controller, OnInit } from "@flamework/core";
import { HttpService, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { BUILD_WINDOW, BuildOption, ITEM_MODELS, LOCAL_PLAYER, MOUSE, PARALLEL } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import Area from "shared/Area";
import { AREAS, PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";
import ItemPlacement from "shared/utils/ItemPlacement";
import { weldModel } from "shared/utils/vrldk/BasePartUtils";


@Controller()
export class BuildController implements OnInit {
    modeOptionsTween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    moveTweenInfo = new TweenInfo(0.095, Enum.EasingStyle.Exponential);
    elapsed = 0;

    animationsEnabled = true;
    restricted = false;
    areaId: AreaId | undefined;
    area: Area | undefined;
    debounce = 0;
    hovering: Model | undefined;
    selected: Model | undefined;
    lastPreselect: Model | undefined;
    rotation = new Instance("IntValue");
    targetsUpdated = new Signal();
    hotkeys = new Map<string, Enum.KeyCode>();
    clickAreaColor = Color3.fromRGB(85, 255, 255);
    acceptableColor = Color3.fromRGB(13, 105, 172);
    unacceptableColor = Color3.fromRGB(255, 51, 51);
    cursorIcon = "rbxassetid://16375707867";
    loadedModels = new Set<Model>();
    placeTime = 0;
    selectingCframe: CFrame | undefined;
    lastCframe: CFrame | undefined;
    swipeMode = false;
    clicking = false;

    t = 0;

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
        this.refreshButton(BUILD_WINDOW.Options.Rotate);
        this.refreshButton(BUILD_WINDOW.Options.Delete);
        BUILD_WINDOW.Options.Place.TextLabel.Text = UserInputService.TouchEnabled === true ? "Place" : "Swipe Mode";
        this.refreshButton(BUILD_WINDOW.Options.Place);
    }

    deletePlacingModel(except?: Model) {
        for (const m of PLACED_ITEMS_FOLDER.GetChildren()) {
            if (m.GetAttribute("placing") === true && except?.Name !== m.Name) {
                m.Destroy();
            }
        }
    }

    setSelected(model?: Model) {
        PARALLEL.SendMessage("Selecting", model);
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
        if (itemModel === undefined)
            throw "how";

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
        this.onMouseMove();
        this.debounce = tick();
    }

    revertSelected() {
        const originalPos = this.selected?.GetAttribute("OriginalPos") as Vector3 | undefined;
        if (originalPos !== undefined) {
            Packets.placeItem.invoke(this.selected?.GetAttribute("ItemId") as string, originalPos,
                (this.selected?.GetAttribute("Rotation") as number | undefined) ?? this.rotation.Value);
        }
    }

    placeSelected(useCurrentPos?: boolean) {
        if (this.selected !== undefined) {
            const itemId = this.selected.GetAttribute("ItemId") as string | undefined;
            if (itemId === undefined)
                return false;
            const item = Items.getItem(itemId);
            if (item === undefined)
                return false;

            if (!ItemPlacement.isItemModelAcceptable(this.selected, item)) {
                return false;
            }
            this.debounce = tick();
            const pos = useCurrentPos === true ? this.selected.PrimaryPart!.Position : MOUSE.Hit.Position;
            if (this.selected.GetAttribute("placing") === true) {
                const [success, amount] = Packets.placeItem.invoke(itemId, pos, this.rotation.Value);
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
                Packets.moveItem.invoke(this.selected.Name, pos, this.rotation.Value);
                return true;
            }
            return false;
        }
    }

    onMouseMove(changePos?: boolean) {
        if (this.selected !== undefined) {
            MOUSE.TargetFilter = PLACED_ITEMS_FOLDER;
            const pp = this.selected.PrimaryPart;
            this.areaId = LOCAL_PLAYER.GetAttribute("Area") as AreaId | undefined;
            if (pp !== undefined && this.areaId !== undefined) {
                this.area = AREAS[this.areaId];
                const pos = changePos === false ? pp.CFrame : MOUSE.Hit;
                const buildBounds = this.area.buildBounds;
                if (buildBounds === undefined) {
                    return;
                }
                const cframe = buildBounds.calcPlacementCFrame(pp.Size, pos.Position, math.rad(this.rotation.Value), this.rotation.Value % 90 !== 0);
                this.selectingCframe = cframe;
                if (this.animationsEnabled) {
                    TweenService.Create(pp, this.moveTweenInfo, { CFrame: cframe }).Play();
                }
                else {
                    pp.CFrame = cframe;
                }
                if (this.clicking === true && this.swipeMode === true) {
                    this.onClick();
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

    onClick(useCurrentPos?: boolean) {
        if (this.selected !== undefined) {
            if (useCurrentPos === true || this.lastCframe === this.selectingCframe || UserInputService.TouchEnabled === false) {
                this.uiController.playSound(this.placeSelected(useCurrentPos) === true ? "Place" : "Error");
            }
            this.lastCframe = this.selectingCframe;
        }
        else {
            const [hovering, item] = this.getCurrentlyHovering();
            if (hovering !== undefined && this.lastPreselect === hovering) {
                this.uiController.playSound("Pickup");
                Packets.unplaceItems.inform([hovering.Name]);
                this.placeNewItem(item, hovering.PrimaryPart?.Position, (hovering.GetAttribute("Rotation") as number | undefined) ?? 0);
            }
        }
    }

    getCurrentlyHovering() {
        const hovering = this.hovering;
        const target = MOUSE.Target;
        if (hovering === undefined || target === undefined || target.Name === "UpgradeActionsPart" ||
            target.Name === "UpgradeOptionsPart" || target.FindFirstChildOfClass("ClickDetector") !== undefined)
            return $tuple(undefined, undefined);
        const item = Items.getItem(hovering.GetAttribute("ItemId") as string);
        if (item === undefined)
            return $tuple(undefined, undefined);

        return $tuple(hovering, item);
    }

    onInit() {
        Packets.settings.observe((value) => this.animationsEnabled = value.BuildAnimation);

        Workspace.CurrentCamera?.GetPropertyChangedSignal("CFrame").Connect(() => this.onMouseMove());
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true)
                return;

            if (input.UserInputType === Enum.UserInputType.Touch || input.UserInputType === Enum.UserInputType.MouseButton1 || input.KeyCode === Enum.KeyCode.ButtonL1) {
                this.clicking = true;
                if (this.selected === undefined) {
                    this.onMouseMove();
                    [this.lastPreselect] = this.getCurrentlyHovering();
                }
            }
        });
        UserInputService.TouchEnded.Connect((_touch, gameProcessed) => {
            if (gameProcessed === true)
                return;
            this.onMouseMove();
            this.onClick();
        });
        UserInputService.TouchMoved.Connect((_touch, gameProcessed) => {
            if (gameProcessed === true)
                return;
            this.onMouseMove();
        });
        UserInputService.InputChanged.Connect((input, gameProcessed) => {
            if (gameProcessed === true)
                return;
            if (input.UserInputType === Enum.UserInputType.MouseMovement)
                this.onMouseMove();
        });
        UserInputService.InputEnded.Connect((input, gameProcessed) => {
            if (gameProcessed === true)
                return;

            if (input.UserInputType !== Enum.UserInputType.MouseButton1 && input.KeyCode !== Enum.KeyCode.ButtonL1)
                return;
            this.clicking = false;
            this.onClick();
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
        this.hotkeysController.setHotkey(BUILD_WINDOW.Options.Rotate, Enum.KeyCode.R, () => {
            if (this.selected !== undefined || this.restricted === true) {
                this.uiController.playSound("Woosh");
                if (this.rotation.Value >= 270) {
                    this.rotation.Value = 0;
                }
                else {
                    this.rotation.Value += 90;
                }
                this.onMouseMove(!UserInputService.TouchEnabled);
                return true;
            }
            return false;
        }, "Rotate");
        this.hotkeysController.setHotkey(BUILD_WINDOW.Options.Delete, Enum.KeyCode.Delete, () => {
            if (this.selected === undefined || this.restricted === true)
                return false;
            this.uiController.playSound("Delete");
            this.setSelected(undefined);
            return true;
        }, "Unplace");
        this.hotkeysController.setHotkey(BUILD_WINDOW.Options.Place, UserInputService.TouchEnabled === true ? undefined : Enum.KeyCode.LeftControl, () => {
            if (this.selected === undefined || this.restricted === true)
                return false;
            if (UserInputService.TouchEnabled === true)
                this.onClick(true);
            else
                toggleSwipe();
            return true;
        }, UserInputService.TouchEnabled === true ? "Place" : "Toggle Swipe", 1, () => {
            if (this.selected === undefined || this.restricted === true)
                return false;
            toggleSwipe(false);
            return true;
        });

        const toggleSwipe = (enabled?: boolean) => {
            this.swipeMode = enabled ?? !this.swipeMode;
            BUILD_WINDOW.Options.Place.ImageLabel.ImageColor3 = this.swipeMode === true || UserInputService.TouchEnabled === true ?
                Color3.fromRGB(170, 255, 127) : Color3.fromRGB(255, 110, 110);
        };
        toggleSwipe(false);

        let previouslyRestricted = false;
        const buildRestrictionsChanged = () => {
            const permLevel = LOCAL_PLAYER.GetAttribute("PermissionLevel") as number;
            if (permLevel === undefined) {
                return;
            }
            this.restricted = (permLevels.build ?? 0) > permLevel;
            if (this.restricted !== previouslyRestricted) {
                print('noo');
            }
            this.refreshBuildWindow();
            previouslyRestricted = this.restricted;
        };
        let permLevels: { [key: string]: number; } = {};
        Packets.permLevels.observe((value) => {
            permLevels = value;
            buildRestrictionsChanged();
        });
        const onTargetsUpdated = () => {
            this.refreshBuildWindow();
        };
        onTargetsUpdated();
        this.targetsUpdated.connect(() => onTargetsUpdated());
        LOCAL_PLAYER.GetAttributeChangedSignal("PermissionLevel").Connect(() => buildRestrictionsChanged());
        buildRestrictionsChanged();
        task.spawn(() => {
            while (task.wait(0.2)) {
                if (tick() - this.debounce < 0.5)
                    continue;
                const itemId = this.selected?.GetAttribute("ItemId");
                if (itemId !== undefined) {
                    const amt = Packets.inventory.get().get(itemId as string);
                    if (amt === undefined || amt <= 0)
                        this.setSelected(undefined);
                }
            }
        });

        PLACED_ITEMS_FOLDER.ChildRemoved.Connect((model) => {
            if (this.selected === model)
                this.setSelected(undefined);
        });
    }
}