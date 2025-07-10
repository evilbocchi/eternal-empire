/**
 * @fileoverview ToolController - Client controller for managing tool usage, harvesting, and backpack UI.
 *
 * Handles:
 * - Tool equipping, unequipping, and hotkey selection
 * - Harvestable detection, health updates, and effects
 * - Tool animations and sound feedback
 * - Backpack window management and tool option UI
 * - Integration with BuildController, AreaController, and TooltipController
 *
 * The controller manages tool state, UI, and interactions, providing a responsive experience for harvesting and tool switching.
 *
 * @since 1.0.0
 */
import { OnoeNum } from "@antivivi/serikanum";
import { loadAnimation } from "@antivivi/vrldk";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { Debris, RunService, StarterGui, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { ADAPTIVE_TAB } from "client/controllers/core/AdaptiveTabController";
import BuildController from "client/controllers/gameplay/BuildController";
import TooltipController, { Tooltip } from "client/controllers/interface/TooltipController";
import { OnCharacterAdded } from "client/controllers/core/ModdingController";
import UIController, { INTERFACE } from "client/controllers/core/UIController";
import AreaController from "client/controllers/world/AreaController";
import { AREAS } from "shared/Area";
import { ASSETS, emitEffect } from "shared/asset/GameAssets";
import Harvestable from "shared/Harvestable";
import ItemUtils from "shared/item/ItemUtils";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

declare global {
    type ToolOption = ItemSlot & {
        UIStroke: UIStroke,
    };

    interface Assets {
        HarvestableGui: BillboardGui & {
            HealthBar: Bar,
            NameLabel: TextLabel;
        };

        ToolOption: ToolOption;
    }
}

export const BACKPACK_WINDOW = INTERFACE.WaitForChild("BackpackWindow") as Frame & {
    UIListLayout: UIListLayout;
};

/**
 * Controller responsible for managing tool usage, harvesting, and backpack UI.
 *
 * Handles tool equipping, harvesting logic, tool animations, and UI updates for the player's tools.
 */
@Controller()
export default class ToolController implements OnInit, OnStart, OnCharacterAdded {

    swingAnimation?: AnimationTrack;
    harvestables = new Map<Instance, typeof ASSETS.HarvestableGui>();
    lastUse = 0;
    readonly tweenInfo = new TweenInfo(0.5);
    readonly tools = new Map<Tool, ToolOption>();
    readonly KEY_CODES = new Map<number, Enum.KeyCode>([
        [1, Enum.KeyCode.One],
        [2, Enum.KeyCode.Two],
        [3, Enum.KeyCode.Three],
        [4, Enum.KeyCode.Four],
        [5, Enum.KeyCode.Five],
        [6, Enum.KeyCode.Six],
        [7, Enum.KeyCode.Seven],
        [8, Enum.KeyCode.Eight],
        [9, Enum.KeyCode.Nine],
        [10, Enum.KeyCode.Zero],
    ]);
    readonly OVERLAP_PARAMS = (function () {
        const params = new OverlapParams();
        params.CollisionGroup = "ItemHitbox";
        return params;
    })();

    constructor(private tooltipController: TooltipController, private uiController: UIController, private areaController: AreaController, private buildController: BuildController) {

    }

    /**
     * Checks for a harvestable object in range of the tool.
     * @param tool The tool model to check from.
     * @returns The harvestable model or part, if found.
     */
    checkHarvestable(tool: Model) {
        const blade = ((tool.FindFirstChild("Blade") as BasePart | undefined) ?? tool.PrimaryPart);
        const inside = Workspace.GetPartBoundsInBox(blade!.CFrame, blade!.Size.add(new Vector3(1, 5, 1)), this.OVERLAP_PARAMS);
        for (const touching of inside) {
            const tParent = touching.Parent;
            if (tParent === undefined)
                continue;
            if (tParent.IsA("Model")) {
                if (tParent.Parent?.Name === "Harvestable")
                    return tParent;
            }
            else if (tParent.Name === "Harvestable")
                return touching;
        }
    }

    /**
     * Loads and sets up a harvestable's GUI and health tracking.
     * @param model The harvestable model instance.
     */
    loadHarvestable(model: Instance) {
        if (!model.IsA("PVInstance"))
            return;
        const gui = ASSETS.HarvestableGui.Clone();
        const harvestable = Harvestable[model.Name as HarvestableId];
        if (harvestable === undefined)
            return;
        const item = Items.getItem(model.Name);
        gui.NameLabel.Text = item?.name ?? harvestable.name ?? model.Name;
        let isNew = true;
        let prevHealth = 0;
        const updateHealth = () => {
            const currentHealth = model.GetAttribute("Health") as number;
            this.areaController.refreshBar(gui.HealthBar, new OnoeNum(model.GetAttribute("Health") as number), new OnoeNum(harvestable.health), false);
            const drop = currentHealth - prevHealth;
            prevHealth = currentHealth;

            if (isNew === true) {
                isNew = false;
                return;
            }

            const currentTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
            if (currentTool === undefined)
                return;

            const highlight = new Instance("Highlight");
            TweenService.Create(highlight, this.tweenInfo, { FillTransparency: 1, OutlineTransparency: 1 }).Play();
            highlight.Adornee = model;

            const blade = currentTool.FindFirstChild("Blade") as BasePart | undefined;
            const effect = emitEffect("ToolUse", blade ?? model);
            effect.Color = new ColorSequence(blade?.Color ?? new Color3(255, 0, 0));

            if (drop < 0) {
                const item = Items.getItem(currentTool.Name);
                if (item === undefined)
                    return;

                const harvestingTool = item.findTrait("HarvestingTool");
                if (harvestingTool === undefined)
                    return;

                const multi = -drop / harvestingTool.damage!;
                effect.Brightness = multi;
                const color = multi > 1 ? Color3.fromRGB(217, 0, (multi - 1) * 120) : Color3.fromRGB(217, 0, 0);
                const gui = ItemUtils.loadDropletGui(undefined, OnoeNum.toString(drop));
                const valueLabel = gui.Frame.ValueLabel;
                valueLabel.Size = new UDim2(1, 0, 0.125 * (math.max(multi, 1) / 2 + 0.5), 0);
                valueLabel.TextColor3 = color;
                valueLabel.UIStroke.Color = color;
                gui.Adornee = model;
                gui.Parent = model;
                if (multi > 1.5) {
                    this.uiController.playSound("Critical.mp3");
                }
            }

            this.uiController.playSound("Harvest.mp3");

            highlight.Parent = model;
            Debris.AddItem(highlight, 2);
        };
        this.harvestables.set(model, gui);
        gui.Parent = model;
        updateHealth();
        const connection = model.GetAttributeChangedSignal("Health").Connect(updateHealth);
        model.Destroying.Connect(() => connection.Disconnect());
    }

    /**
     * Initializes the ToolController, sets up input listeners, harvestable loading, and disables default backpack UI.
     */
    onInit() {
        StarterGui.SetCoreGuiEnabled("Backpack", false);
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true)
                return;

            if (input.UserInputType === Enum.UserInputType.MouseButton1 || input.UserInputType === Enum.UserInputType.Touch || input.KeyCode === Enum.KeyCode.ButtonL1) {
                const currentTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
                if (currentTool === undefined)
                    return;

                const item = Items.getItem(currentTool.Name);
                if (item === undefined)
                    return;
                const harvestingTool = item.findTrait("HarvestingTool");
                if (harvestingTool === undefined || harvestingTool.toolType === "None")
                    return;

                const t = tick();
                if (this.lastUse + 8 / (harvestingTool.speed ?? 1) > t)
                    return;
                this.lastUse = t;
                const anim = this.swingAnimation;
                if (anim === undefined)
                    return;
                anim.Stopped.Once(() => Packets.useTool.inform(this.checkHarvestable(currentTool) ?? Workspace));
                anim.Play();
                this.uiController.playSound("ToolSwing.mp3");
            }
            else if (ADAPTIVE_TAB.Visible === false) {
                for (const [i, v] of this.KEY_CODES) {
                    if (input.KeyCode !== v)
                        continue;

                    const toolOption = this.recalculateIndex()[i];
                    if (toolOption === undefined)
                        return;
                    let tool: Tool | undefined;
                    for (const [t, option] of this.tools) {
                        if (option === toolOption) {
                            tool = t;
                            break;
                        }
                    }
                    if (tool === undefined)
                        return;

                    const backpack = LOCAL_PLAYER.FindFirstChildOfClass("Backpack");
                    this.uiController.playSound("Equip.mp3");
                    if (tool.Parent === backpack) {
                        const currentTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
                        if (currentTool !== undefined)
                            currentTool.Parent = backpack;
                        tool.Parent = LOCAL_PLAYER.Character;
                    }
                    else {
                        tool.Parent = backpack;
                    }
                    break;
                }
            }


        });

        for (const [_id, area] of pairs(AREAS)) {
            const folder = area.areaFolder.FindFirstChild("Harvestable");
            if (folder === undefined)
                continue;
            const harvestables = folder.GetChildren();
            folder.ChildAdded.Connect((model) => this.loadHarvestable(model));
            for (const model of harvestables) {
                this.loadHarvestable(model);
            }
        }
    }

    /**
     * Recalculates tool option indices and updates their labels.
     * @returns The sorted array of ToolOption instances.
     */
    recalculateIndex() {
        const sorted = BACKPACK_WINDOW.GetChildren().sort((a, b) => {
            if (a.IsA("TextButton") && b.IsA("TextButton"))
                return a.LayoutOrder < b.LayoutOrder;
            return false;
        }) as ToolOption[];

        let i = 0;
        for (const toolOption of sorted) {
            if (!toolOption.IsA("TextButton"))
                continue;

            i++;
            toolOption.AmountLabel.Text = `${i}`;
        }
        return sorted;
    }

    /**
     * Handles character addition, sets up tool animations and backpack listeners.
     * @param character The player's character model.
     */
    onCharacterAdded(character: Model): void {
        {
            const humanoid = character.WaitForChild("Humanoid") as Humanoid;
            this.swingAnimation = loadAnimation(humanoid, 16920778613);
            const backpack = LOCAL_PLAYER.WaitForChild("Backpack");
            for (const tool of backpack.GetChildren())
                this.onToolAdded(tool);
            backpack.ChildAdded.Connect((tool) => {
                this.onToolAdded(tool);
            });

            humanoid.Died.Once(() => {
                for (const toolOption of BACKPACK_WINDOW.GetChildren()) {
                    if (toolOption.IsA("TextButton")) {
                        toolOption.Destroy();
                    }
                }
                this.tools.clear();
            });

            character.ChildAdded.Connect((child) => {
                if (child.IsA("Tool")) {
                    for (const [_, gui] of this.harvestables)
                        gui.Enabled = true;
                }
            });

            character.ChildRemoved.Connect((child) => {
                if (child.IsA("Tool")) {
                    for (const [_, gui] of this.harvestables)
                        gui.Enabled = false;
                }
            });
        }
    }

    /**
     * Loads and sets up a tool option UI for a given tool.
     * @param tool The tool instance to add.
     */
    onToolAdded(tool: Instance) {
        if (!tool.IsA("Tool") || this.tools.has(tool) === true)
            return;
        const item = Items.getItem(tool.Name);
        if (item === undefined)
            return;
        const harvestingTool = item.findTrait("HarvestingTool");
        if (harvestingTool === undefined)
            return;

        const toolOption = ASSETS.ToolOption.Clone();
        toolOption.ImageLabel.Image = tool.TextureId;
        this.tools.set(tool, toolOption);
        let layoutOrder: number;
        switch (harvestingTool.toolType) {
            case "Pickaxe":
                layoutOrder = 1;
                break;
            case "Axe":
                layoutOrder = 2;
                break;
            case "Scythe":
                layoutOrder = 3;
                break;
            case "Rod":
                layoutOrder = 4;
                break;
            case "None":
            default:
                layoutOrder = item.layoutOrder;
                break;
        }
        toolOption.LayoutOrder = layoutOrder;
        toolOption.Name = tool.Name;

        const connection = tool.AncestryChanged.Connect(() => {
            if (tool.Parent === undefined || toolOption.Parent === undefined) {
                pcall(() => toolOption.Destroy());
                connection.Disconnect();
                return;
            }
            const color = tool.Parent === LOCAL_PLAYER.FindFirstChildOfClass("Backpack") ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(0, 184, 255);
            toolOption.BackgroundColor3 = color;
            toolOption.UIStroke.Color = color;
        });
        if (item !== undefined) {
            this.tooltipController.setTooltip(toolOption, Tooltip.fromItem(item));
        }
        toolOption.Activated.Connect(() => {
            const backpack = LOCAL_PLAYER.FindFirstChildOfClass("Backpack");
            this.uiController.playSound("Equip.mp3");
            if (tool.Parent === backpack) {
                const currentTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
                if (currentTool !== undefined)
                    currentTool.Parent = backpack;
                tool.Parent = LOCAL_PLAYER.Character;
            }
            else {
                tool.Parent = backpack;
            }
        });
        toolOption.Parent = BACKPACK_WINDOW;
        this.recalculateIndex();
    }

    /**
     * Starts the ToolController, manages backpack window visibility based on UI state.
     */
    onStart() {
        const refreshVisibility = () => BACKPACK_WINDOW.Visible = !ADAPTIVE_TAB.Visible && this.buildController.selected.isEmpty();
        RunService.BindToRenderStep("Tool Backpack", 0, () => refreshVisibility());
    }
}