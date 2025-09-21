/**
 * @fileoverview Client controller for managing tool usage, harvesting, and backpack UI.
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
import { Controller, OnInit } from "@flamework/core";
import { Debris, StarterGui, TweenService, UserInputService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { OnCharacterAdded } from "client/controllers/core/ModdingController";
import TooltipController from "client/controllers/interface/TooltipController";
import AreaController from "client/controllers/world/AreaController";
import { AREAS } from "shared/world/Area";
import { ASSETS, emitEffect, playSound } from "shared/asset/GameAssets";
import Harvestable from "shared/world/Harvestable";
import ItemUtils from "shared/item/ItemUtils";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

declare global {
    interface Assets {
        HarvestableGui: BillboardGui & {
            HealthBar: Bar;
            NameLabel: TextLabel;
        };
    }
}

/**
 * Controller responsible for managing tool usage, harvesting, and backpack data.
 *
 * Handles tool equipping, harvesting logic, tool animations, and tool data tracking for React UI.
 */
@Controller()
export default class ToolController implements OnInit, OnCharacterAdded {
    swingAnimation?: AnimationTrack;
    harvestables = new Map<Instance, typeof ASSETS.HarvestableGui>();
    lastUse = 0;
    readonly tweenInfo = new TweenInfo(0.5);
    readonly OVERLAP_PARAMS = (function () {
        const params = new OverlapParams();
        params.CollisionGroup = "ItemHitbox";
        return params;
    })();

    constructor(
        private tooltipController: TooltipController,
        private areaController: AreaController,
    ) {}

    /**
     * Checks for a harvestable object in range of the tool.
     * @param tool The tool model to check from.
     * @returns The harvestable model or part, if found.
     */
    checkHarvestable(tool: Model) {
        const blade = (tool.FindFirstChild("Blade") as BasePart | undefined) ?? tool.PrimaryPart;
        const inside = Workspace.GetPartBoundsInBox(
            blade!.CFrame,
            blade!.Size.add(new Vector3(1, 5, 1)),
            this.OVERLAP_PARAMS,
        );
        for (const touching of inside) {
            const tParent = touching.Parent;
            if (tParent === undefined) continue;
            if (tParent.IsA("Model")) {
                if (tParent.Parent?.Name === "Harvestable") return tParent;
            } else if (tParent.Name === "Harvestable") return touching;
        }
    }

    /**
     * Loads and sets up a harvestable's GUI and health tracking.
     * @param model The harvestable model instance.
     */
    loadHarvestable(model: Instance) {
        if (!model.IsA("PVInstance")) return;
        const gui = ASSETS.HarvestableGui.Clone();
        const harvestable = Harvestable[model.Name as HarvestableId];
        if (harvestable === undefined) return;
        const item = Items.getItem(model.Name);
        gui.NameLabel.Text = item?.name ?? harvestable.name ?? model.Name;
        let isNew = true;
        let prevHealth = 0;
        const updateHealth = () => {
            const currentHealth = model.GetAttribute("Health") as number;
            // this.areaController.refreshBar(
            //     gui.HealthBar,
            //     new OnoeNum(model.GetAttribute("Health") as number),
            //     new OnoeNum(harvestable.health),
            //     false,
            // ); TODO: Port to React
            const drop = currentHealth - prevHealth;
            prevHealth = currentHealth;

            if (isNew === true) {
                isNew = false;
                return;
            }

            const currentTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
            if (currentTool === undefined) return;

            const highlight = new Instance("Highlight");
            TweenService.Create(highlight, this.tweenInfo, { FillTransparency: 1, OutlineTransparency: 1 }).Play();
            highlight.Adornee = model;

            const blade = currentTool.FindFirstChild("Blade") as BasePart | undefined;
            const effect = emitEffect("ToolUse", blade ?? model);
            effect.Color = new ColorSequence(blade?.Color ?? new Color3(255, 0, 0));

            if (drop < 0) {
                const item = Items.getItem(currentTool.Name);
                if (item === undefined) return;

                const gear = item.findTrait("Gear");
                if (gear === undefined) return;

                const multi = -drop / gear.damage!;
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
                    playSound("Critical.mp3");
                }
            }

            playSound("Harvest.mp3");

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
            if (gameProcessed === true) return;

            if (
                input.UserInputType === Enum.UserInputType.MouseButton1 ||
                input.UserInputType === Enum.UserInputType.Touch ||
                input.KeyCode === Enum.KeyCode.ButtonL1
            ) {
                const currentTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
                if (currentTool === undefined) return;

                const item = Items.getItem(currentTool.Name);
                if (item === undefined) return;
                const gear = item.findTrait("Gear");
                if (gear === undefined || gear.type === "None") return;

                const t = tick();
                if (this.lastUse + 8 / (gear.speed ?? 1) > t) return;
                this.lastUse = t;
                const anim = this.swingAnimation;
                if (anim === undefined) return;
                anim.Stopped.Once(() => Packets.useTool.toServer(this.checkHarvestable(currentTool) ?? Workspace));
                anim.Play();
                playSound("ToolSwing.mp3");
            }
        });

        for (const [_id, area] of pairs(AREAS)) {
            const folder = area.worldNode.getInstance()?.FindFirstChild("Harvestable");
            if (folder === undefined) continue;
            const harvestables = folder.GetChildren();
            folder.ChildAdded.Connect((model) => this.loadHarvestable(model));
            for (const model of harvestables) {
                this.loadHarvestable(model);
            }
        }
    }

    /**
     * Handles character addition, sets up tool animations and backpack listeners.
     * @param character The player's character model.
     */
    onCharacterAdded(character: Model): void {
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        this.swingAnimation = loadAnimation(humanoid, 16920778613);
        character.ChildAdded.Connect((child) => {
            if (child.IsA("Tool")) {
                for (const [_, gui] of this.harvestables) gui.Enabled = true;
            }
        });
        character.ChildRemoved.Connect((child) => {
            if (child.IsA("Tool")) {
                for (const [_, gui] of this.harvestables) gui.Enabled = false;
            }
        });
    }
}
