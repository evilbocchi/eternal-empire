import { Controller } from "@flamework/core";
import { RunService, TweenService } from "@rbxts/services";
import { ITEM_MODELS } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Difficulty from "shared/Difficulty";
import { ItemSlot, UI_ASSETS } from "shared/constants";
import Item from "shared/item/Item";
import { Fletchette } from "shared/utils/fletchette";
import { paintObjects } from "shared/utils/vrldk/UIUtils";

const ItemsCanister = Fletchette.getCanister("ItemsCanister");

@Controller()
export class ItemSlotController {
    tween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    inventory = new Map<string, number>();

    constructor(private uiController: UIController, private tooltipController: TooltipController) {

    }

    getItemSlot(item: Item): [ItemSlot, RBXScriptConnection?] {
        const itemSlot = UI_ASSETS.ItemListContainer.ItemSlot.Clone();
        const c = item.difficulty?.color ?? new Color3();
        itemSlot.UIStroke.Color = new Color3(c.R * 0.5, c.G * 0.5, c.B * 0.5);
        const v = this.loadViewportFrame(itemSlot.ViewportFrame, item);
        itemSlot.Name = item.id;
        this.tooltipController.setTooltip(itemSlot, item.name ?? "error");
        return [itemSlot, v];
    }

    getDifficultyOption(difficulty: Difficulty) {
        const difficultyOption = UI_ASSETS.ItemListContainer.DifficultyOption.Clone();
        difficultyOption.Dropdown.DifficultyLabel.Text = difficulty.name ?? "error";
        paintObjects(difficultyOption.Dropdown, difficulty.color ?? Color3.fromRGB());
        difficultyOption.Dropdown.Activated.Connect(() => {
            this.uiController.playSound("Flip");
            if (difficultyOption.Items.Visible) {
                difficultyOption.Items.Visible = false;
                TweenService.Create(difficultyOption.Dropdown.ImageLabel, this.tween, { Rotation: 180 }).Play();
            }
            else {
                difficultyOption.Items.Visible = true;
                TweenService.Create(difficultyOption.Dropdown.ImageLabel, this.tween, { Rotation: 0 }).Play();
            }
        });
        difficultyOption.Name = difficulty.id;
        difficultyOption.LayoutOrder = (difficulty.rating ?? 0) * 100;
        return difficultyOption;
    }

    loadViewportFrame(viewportFrame: ViewportFrame, item: Item) {
        const camera = new Instance("Camera");
        camera.CameraType = Enum.CameraType.Scriptable;
        viewportFrame.CurrentCamera = camera;
        camera.Parent = viewportFrame;
        const blurEffect = new Instance("BlurEffect");
        blurEffect.Parent = camera;
        const m = ITEM_MODELS.get(item.id);
        if (m === undefined)
            return;
        const model = m.Clone();
        model.PivotTo(new CFrame(0, 0, 0));
        const hitbox = model.WaitForChild("Hitbox") as BasePart;
        const rel = (hitbox.Size.X + hitbox.Size.Y + hitbox.Size.Z);
        const centerCFrame = new CFrame(0, 0, 0);
        const offsetCFrameValue = new Instance("CFrameValue");
        offsetCFrameValue.Value = new CFrame(0, 4, (rel * 0.35) + 5);
        offsetCFrameValue.Parent = camera;
        let currentAngle = 0;
        viewportFrame.SetAttribute("Delta", 0.4);
        function rotateCamera(dt: number) {
            const delta = viewportFrame.GetAttribute("Delta") as number | undefined;
            if (delta === undefined || delta === 0 || viewportFrame.Visible === false || ((viewportFrame.Parent as GuiObject).Visible === false)) {
                return;
            }
            camera.CFrame = CFrame.lookAt(centerCFrame.mul(CFrame.Angles(0, math.rad(currentAngle), 0).mul(offsetCFrameValue.Value)).Position, centerCFrame.Position);
            currentAngle = currentAngle + (delta * 60 * dt);
        }
        viewportFrame.MouseEnter.Connect(() => {
            viewportFrame.SetAttribute("Delta", 1);
            TweenService.Create(offsetCFrameValue, this.tween, {Value: new CFrame(0, 4, (rel * 0.35) + 2)}).Play();
        });
        viewportFrame.MouseLeave.Connect(() => {
            viewportFrame.SetAttribute("Delta", 0.4);
            TweenService.Create(offsetCFrameValue, this.tween, {Value: new CFrame(0, 4, (rel * 0.35) + 5)}).Play();
        });
        const connection = RunService.Heartbeat.Connect((dt) => {
            if (viewportFrame === undefined || viewportFrame.Parent === undefined) {
                connection.Disconnect();
                return;
            }
            rotateCamera(dt);
        });
        rotateCamera(0);
        model.Parent = viewportFrame;
        return connection;
    }
}