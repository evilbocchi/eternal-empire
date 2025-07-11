import { Controller } from "@flamework/core";
import { RunService, TweenService } from "@rbxts/services";
import { ITEM_MODELS, SHOP_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { ASSETS, ItemSlot, RESET_LAYERS } from "shared/constants";
import Item from "shared/item/Item";
import { OnoeNum } from "@antivivi/serikanum";
import { combineHumanReadable, formatRichText } from "shared/utils/vrldk/StringUtils";
import { paintObjects } from "shared/utils/vrldk/UIUtils";

@Controller()
export class ItemSlotController {
    
    descColor = SHOP_WINDOW.PurchaseWindow.DescriptionFrame.DescriptionLabel.TextColor3;
    tween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    inventory = new Map<string, number>();

    constructor(private uiController: UIController, private tooltipController: TooltipController) {

    }

    getItemSlot(item: Item): [ItemSlot, RBXScriptConnection?] {
        const itemSlot = ASSETS.ItemListContainer.ItemSlot.Clone();
        const c = item.difficulty?.color ?? new Color3();
        const color = new Color3(math.max(math.min(0.9, c.R), 0.1), math.max(math.min(0.9, c.G), 0.1), math.max(math.min(0.9, c.B), 0.1));
        itemSlot.UIStroke.Color = color;
        itemSlot.BackgroundColor3 = color;
        itemSlot.Frame.BackgroundColor3 = color;
        const v = this.loadViewportFrame(itemSlot.ViewportFrame, item);
        itemSlot.Name = item.id;
        const tooltip = `${item.name ?? item.id}\n${this.formatDescription(item, 15, "Medium")}`
        this.tooltipController.setTooltip(itemSlot, tooltip);
        return [itemSlot, v];
    }

    getDifficultyOption(difficulty: Difficulty) {
        const difficultyOption = ASSETS.ItemListContainer.DifficultyOption.Clone();
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
        const rel = (math.max(hitbox.Size.X, hitbox.Size.Y, hitbox.Size.Z) * 1.25) - 1.5 + (item.isA("Dropper") ? 1 : 0);
        const centerCFrame = new CFrame(0, 0, 0);
        const offsetCFrameValue = new Instance("CFrameValue");
        const unfocused = new CFrame(0, 4, rel + 1);
        const focused = new CFrame(0, 4, rel);
        offsetCFrameValue.Value = unfocused;
        offsetCFrameValue.Parent = camera;
        let currentAngle = 220;
        let delta = 0;
        function rotateCamera(dt: number, care: boolean) {
            if (care === true && runningTween === undefined && (delta === 0 || viewportFrame.Visible === false || ((viewportFrame.Parent as GuiObject).Visible === false))) {
                return;
            }
            const newCframe = CFrame.lookAt(centerCFrame.mul(CFrame.Angles(0, math.rad(currentAngle), 0).mul(offsetCFrameValue.Value)).Position, centerCFrame.Position);
            if (camera.CFrame !== newCframe) {
                camera.CFrame = newCframe;
                currentAngle = currentAngle + (delta * 60 * dt);
            }
        }
        let runningTween: Tween | undefined = undefined;
        viewportFrame.MouseEnter.Connect(() => {
            delta = 0.5;
            const tween = TweenService.Create(offsetCFrameValue, this.tween, {Value: focused});
            runningTween = tween;
            tween.Completed.Connect(() => {
                if (tween === runningTween)
                    runningTween = undefined;
            });
            tween.Play();
        });
        viewportFrame.MouseLeave.Connect(() => {
            delta = 0;
            const tween = TweenService.Create(offsetCFrameValue, this.tween, {Value: unfocused});
            runningTween = tween;
            tween.Completed.Connect(() => {
                if (tween === runningTween)
                    runningTween = undefined;
            });
            tween.Play();
        });
        const connection = RunService.Heartbeat.Connect((dt) => {
            if (viewportFrame === undefined || viewportFrame.Parent === undefined) {
                connection.Disconnect();
                return;
            }
            rotateCamera(dt, true);
        });
        rotateCamera(0, false);
        model.Parent = viewportFrame;
        return connection;
    }

    formatPlaceableAreas(item: Item, size: number, weight: string | number) {
        let paLabel = "";
        const placeableAreas = item.placeableAreas;
        if (placeableAreas !== undefined) {
            const vals = new Array<string>();
            placeableAreas.forEach((area) => {
                if (!area.hidden)
                    vals.push(area.name);
            });
            paLabel = combineHumanReadable(paLabel, ...vals);
        }
        return formatRichText(paLabel === "" ? "This item is unplaceable." : "Placeable in " + paLabel, Color3.fromRGB(248, 255, 221), size, weight); 
    }

    formatFormula(item: Item, multiplier: OnoeNum | undefined, size: number, weight: string | number) {
        let text = `Formula: &lt;${item.formula?.tostring("x")}&gt;`;
        if (multiplier !== undefined)
            text += ` (Currently ${new OnoeNum(multiplier)}x)`;
        return formatRichText(text, Color3.fromRGB(126, 255, 167), size, weight);
    }

    formatResettingAreas(item: Item, size: number, weight: string | number) {
        let text: string;
        const index = item.getResetLayer();
        if (index === -1)
            text = "[Persistent]";
        else 
            text = `[Resets on ${RESET_LAYERS[index].name}]`;
        return formatRichText(text, Color3.fromRGB(255, 99, 99), size, weight);
    }
    
    formatPrice(price: Price) {
        let text = "";
        let i = 0;
        let isInitial = true;
        for (const [currency, amount] of price.costPerCurrency) {
            if (isInitial === true)
                isInitial = false;
            else
                text += ", ";
            text += `<font color="#${Price.DETAILS_PER_CURRENCY[currency].color.ToHex()}" weight="Bold">${Price.getFormatted(currency, amount)}</font>`;
            ++i;
        }
        return i > 1 ? "(" + text + ")" : text;
    }

    formatDescription(item: Item, size: number, weight: string | number) {
        let description = item.description ?? item.id;
        if (item.isA("Upgrader") || item.isA("Charger") || item.isA("Furnace")) {
            if (item.add !== undefined) 
                description = description.gsub("%%add%%", this.formatPrice(item.add))[0];
            if (item.mul !== undefined) 
                description = description.gsub("%%mul%%", this.formatPrice(item.mul))[0];
            if (item.isA("Charger") && item.radius !== undefined)
                description = description.gsub("%%radius%%", item.radius)[0];
        }
        else if (item.isA("Dropper")) {
            if (item.droplet !== undefined && item.droplet.value !== undefined)
                description = description.gsub("%%val%%", this.formatPrice(item.droplet.value))[0];
        }
        else if (item.isA("Generator")) {
            if (item.passiveGain !== undefined) 
                description = description.gsub("%%gain%%", this.formatPrice(item.passiveGain))[0];
        }
        if (item.drain !== undefined)
            description = description.gsub("%%drain%%", this.formatPrice(item.drain))[0];
        return formatRichText(description, this.descColor, size, weight);
    }
}