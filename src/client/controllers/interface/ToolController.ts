import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { Debris, RunService, StarterGui, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { AreaController } from "client/controllers/AreaController";
import { ADAPTIVE_TAB } from "client/controllers/interface/AdaptiveTabController";
import { BuildController } from "client/controllers/interface/BuildController";
import { Tooltip, TooltipController } from "client/controllers/interface/TooltipController";
import { INTERFACE, UIController } from "client/controllers/UIController";
import { AREAS } from "shared/Area";
import { emitEffect } from "shared/GameAssets";
import { ASSETS } from "shared/GameAssets";
import Harvestable from "shared/Harvestable";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import ItemUtils from "shared/item/ItemUtils";
import { loadAnimation } from "@antivivi/vrldk";

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

@Controller()
export class ToolController implements OnInit, OnStart {

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
                    this.uiController.playSound("Critical");
                }
            }

            this.uiController.playSound("Harvest");

            highlight.Parent = model;
            Debris.AddItem(highlight, 2);
        };
        this.harvestables.set(model, gui);
        gui.Parent = model;
        updateHealth();
        const connection = model.GetAttributeChangedSignal("Health").Connect(updateHealth);
        model.Destroying.Connect(() => connection.Disconnect());
    }

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
                this.uiController.playSound("Swing");
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
                    this.uiController.playSound("Equip");
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

    onStart() {
        const refreshVisibility = () => BACKPACK_WINDOW.Visible = !ADAPTIVE_TAB.Visible && this.buildController.selected.isEmpty();
        RunService.BindToRenderStep("Tool Backpack", 0, () => refreshVisibility());
        const onToolAdded = (tool: Instance) => {
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
                this.uiController.playSound("Equip");
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
        };
        const onCharacterAdded = (character: Model) => {
            const humanoid = character.WaitForChild("Humanoid") as Humanoid;
            this.swingAnimation = loadAnimation(humanoid, 16920778613);
            const backpack = LOCAL_PLAYER.WaitForChild("Backpack");
            for (const tool of backpack.GetChildren())
                onToolAdded(tool);
            backpack.ChildAdded.Connect((tool) => {
                onToolAdded(tool);
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
        };

        LOCAL_PLAYER.CharacterAdded.Connect((character) => onCharacterAdded(character));
        if (LOCAL_PLAYER.Character !== undefined)
            onCharacterAdded(LOCAL_PLAYER.Character);
    }
}