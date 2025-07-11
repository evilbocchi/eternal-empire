import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { Debris, RunService, StarterGui, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { ADAPTIVE_TAB, BACKPACK_WINDOW, LOCAL_PLAYER } from "client/constants";
import { EffectController } from "client/controllers/EffectController";
import { BuildController } from "client/controllers/interface/BuildController";
import { ItemSlotController } from "client/controllers/interface/ItemSlotController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import { UIController } from "client/controllers/UIController";
import { AREAS, ASSETS, emitEffect } from "shared/constants";
import Harvestable from "shared/Harvestable";
import HarvestingTool from "shared/item/HarvestingTool";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";
import StringBuilder from "shared/utils/StringBuilder";
import { loadAnimation } from "shared/utils/vrldk/RigUtils";

@Controller()
export class ToolController implements OnInit, OnStart {

    swingAnimation?: AnimationTrack;
    harvestables = new Map<Instance, typeof ASSETS.HarvestableGui>();
    lastUse = 0;
    readonly tweenInfo = new TweenInfo(0.5);
    readonly tools = new Array<Tool>();
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
    readonly OVERLAP_PARAMS = (function() {
        const params = new OverlapParams();
        params.CollisionGroup = "ItemHitbox";
        return params;
    })();

    constructor(private itemSlotController: ItemSlotController, private tooltipController: TooltipController, 
        private uiController: UIController, private effectController: EffectController, private buildController: BuildController) {

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
                if (item === undefined || !item.isA("HarvestingTool") || item.toolType === "None")
                    return;
                const t = tick();
                if (this.lastUse + 8 / (item.speed ?? 1) > t)
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
                    if (input.KeyCode === v) {
                        const tool = this.tools[i - 1];
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
            }
            
            
        });

        for (const [_id, area] of pairs(AREAS)) {
            const harvestables = area.areaFolder.FindFirstChild("Harvestable")?.GetChildren();
            if (harvestables === undefined)
                continue;
            for (const model of harvestables) {
                if (!model.IsA("PVInstance"))
                    continue;
                const gui = ASSETS.HarvestableGui.Clone();
                const harvestable = Harvestable[model.Name as HarvestableId];
                if (harvestable === undefined)
                    continue;
                gui.NameLabel.Text = harvestable.name ?? model.Name;
                let prevHealth = model.GetAttribute("Health") as number;
                const updateHealth = () => {
                    const currentHealth = model.GetAttribute("Health") as number;
                    this.effectController.refreshBar(gui.HealthBar, new OnoeNum(model.GetAttribute("Health") as number), new OnoeNum(harvestable.health), false);
                    
                    const currentTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
                    if (currentTool === undefined)
                        return;
                    const highlight = new Instance("Highlight");
                    TweenService.Create(highlight, this.tweenInfo, { FillTransparency: 1, OutlineTransparency: 1 }).Play();
                    highlight.Adornee = model;

                    const blade = currentTool.FindFirstChild("Blade") as BasePart | undefined;
                    const effect = emitEffect("ToolUse", blade ?? model);
                    effect.Color = new ColorSequence(blade?.Color ?? new Color3(255, 0, 0));
                    const drop = currentHealth - prevHealth;

                    prevHealth = currentHealth;
                    if (drop < 0) {
                        const multi = -drop / (Items.getItem(currentTool.Name) as HarvestingTool).damage!;
                        effect.Brightness = multi;
                        const color = multi > 1 ? Color3.fromRGB(217, 0, (multi - 1) * 120) : Color3.fromRGB(217, 0, 0);
                        this.effectController.loadDropletGui(model.GetPivot().Position, model, undefined, `<font color="#${color.ToHex()}">${OnoeNum.toString(drop)}</font>`, math.max(multi, 1) / 2 + 0.5);
                        if (multi > 1.5) {
                            this.uiController.playSound("Critical");
                        }
                    }
                    this.uiController.playSound("Harvest");

                    highlight.Parent = model;
                    Debris.AddItem(highlight, 2);
                }
                this.harvestables.set(model, gui);
                gui.Parent = model;
                updateHealth();
                model.GetAttributeChangedSignal("Health").Connect(() => updateHealth());
            }
        }
    }

    onStart() {
        const refreshVisibility = () => BACKPACK_WINDOW.Visible = !ADAPTIVE_TAB.Visible && this.buildController.selected === undefined;
        RunService.BindToRenderStep("Tool Backpack", 0, () => refreshVisibility());
        const onToolAdded = (tool: Instance) => {
            if (!tool.IsA("Tool") || this.tools.includes(tool) === true)
                return;
            const item = Items.getItem(tool.Name);
            const toolOption = ASSETS.ToolOption.Clone();
            toolOption.ImageLabel.Image = tool.TextureId;
            const index = this.tools.push(tool);
            const hotkey = this.KEY_CODES.get(index);
            if (hotkey === undefined) {
                return;
            }
            toolOption.LayoutOrder = index;
            toolOption.Name = tool.Name;
            toolOption.AmountLabel.Text = tostring(index); 
            
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
                const desc = new StringBuilder(item.name ?? item.id).append("\n")
                .append(this.itemSlotController.formatMetadata(item, this.itemSlotController.formatDescription(item, 15, "Medium"), 15, "Medium"))
                this.tooltipController.setTooltip(toolOption, desc.toString());
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
        }
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
        }
        
        LOCAL_PLAYER.CharacterAdded.Connect((character) => onCharacterAdded(character));
        if (LOCAL_PLAYER.Character !== undefined)
            onCharacterAdded(LOCAL_PLAYER.Character);
    }
}