import Difficulty from "@antivivi/jjt-difficulties";
import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { PARALLEL, SHOP_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Price from "shared/Price";
import { AREAS, ASSETS, DifficultyOption, ItemSlot, RESET_LAYERS } from "shared/constants";
import Condenser from "shared/item/Condenser";
import HarvestingTool from "shared/item/HarvestingTool";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";
import StringBuilder from "shared/utils/StringBuilder";
import { combineHumanReadable, formatRichText } from "shared/utils/vrldk/StringUtils";
import { paintObjects } from "shared/utils/vrldk/UIUtils";

@Controller()
export class ItemSlotController implements OnInit {

    descColor = SHOP_WINDOW.PurchaseWindow.DescriptionFrame.DescriptionLabel.TextColor3;
    tween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    boostPerItem = new Map<string, BaseOnoeNum>();
    inventory = new Map<string, number>();
    valsPerCondenser = new Map<Condenser, string>();

    constructor(private uiController: UIController, private tooltipController: TooltipController) {

    }

    getItemSlot(item: Item, isTool?: boolean): ItemSlot {
        const itemSlot = ASSETS.ItemListContainer.ItemSlot.Clone();
        const difficulty = item.difficulty;
        const c = difficulty?.color ?? new Color3();
        const color = new Color3(math.max(math.min(0.9, c.R), 0.1), math.max(math.min(0.9, c.G), 0.1), math.max(math.min(0.9, c.B), 0.1));
        itemSlot.UIStroke.Color = color;
        itemSlot.BackgroundColor3 = color;
        itemSlot.Frame.BackgroundColor3 = color;
        itemSlot.LayoutOrder = difficulty?.rating ?? 0;
        if (isTool === true)
            itemSlot.ImageLabel.Image = "rbxassetid://" + ((item as HarvestingTool).image);
        else
            this.loadViewportFrame(itemSlot.ViewportFrame, item);
        itemSlot.Name = item.id;
        this.tooltipController.setTooltip(itemSlot, tostring(new StringBuilder(item.name ?? item.id).append("\n").append(this.formatDescription(item, 15, "Medium"))));
        return itemSlot;
    }

    getDifficultyOption(difficulty: Difficulty): DifficultyOption {
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

    calculateOptimalCellCount(containerX: number): number {
        return math.max(math.round((containerX - 50) / 65), 3);
    }

    loadViewportFrame(viewportFrame: ViewportFrame, item: Item) {
        PARALLEL.SendMessage("LoadViewportFrame", viewportFrame, item.id);
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

    formatFormula(item: Item, multiplier: BaseOnoeNum | undefined, size: number, weight: string | number) {
        let text = `Formula: &lt;${item.formula?.tostring(item.formulaX ?? "x")}&gt;`;
        if (multiplier !== undefined)
            text += ` (Currently x${OnoeNum.toString(multiplier)})`;
        return formatRichText(text, Color3.fromRGB(126, 255, 167), size, weight);
    }

    formatResettingAreas(item: Item, size: number, weight: string | number) {
        let text: string;
        const order = item.getResetLayer();
        if (order > 900)
            text = "[Persistent]";
        else {
            let layer: ResetLayerId | undefined;
            for (const [id, l] of pairs(RESET_LAYERS))
                if (l.order === order) {
                    layer = id;
                    break;
                }
            text = layer === undefined ? "[Persistent]" : `[Resets on ${layer}]`;
        }
        return formatRichText(text, Color3.fromRGB(255, 99, 99), size, weight);
    }

    formatTool(tool: HarvestingTool, size: number, weight: string | number) {
        if (tool.toolType === "None")
            return "";
        return formatRichText("Speed: " + tool.speed, Color3.fromRGB(112, 176, 255), size, weight) + " | " + formatRichText("Damage: " + tool.damage, Color3.fromRGB(255, 71, 0), size, weight);
    }

    formatPrice(price: Price, prefix?: string, suffix?: string) {
        let text = "";
        let i = 0;
        for (const [currency, amount] of price.costPerCurrency) {
            if (i === 1)
                text = " and " + text;
            else if (i > 1)
                text = ", " + text;
            let label = Price.getFormatted(currency, amount);
            if (prefix !== undefined)
                label = prefix + label;
            if (suffix !== undefined)
                label = label + suffix;
            text = `<font color="#${Price.DETAILS_PER_CURRENCY[currency].color.ToHex()}" weight="Bold">${label}</font>` + text;
            ++i;
        }
        return text;
    }

    formatDescription(item: Item, size: number, weight: string | number) {
        let description = item.description ?? item.id;
        if (item.isA("Operative")) {
            if (item.add !== undefined)
                description = description.gsub("%%add%%", this.formatPrice(item.add, "+"))[0];
            if (item.mul !== undefined)
                description = description.gsub("%%mul%%", this.formatPrice(item.mul, "x"))[0];
            if (item.pow !== undefined)
                description = description.gsub("%%pow%%", this.formatPrice(item.pow, "^"))[0];
            if (item.isA("Charger") && item.radius !== undefined)
                description = description.gsub("%%radius%%", item.radius)[0];
        }
        if (item.isA("Condenser")) {
            description = description.gsub("%%val%%", this.valsPerCondenser.get(item)!)[0];
        }
        else if (item.isA("Dropper")) {
            if (item.droplet !== undefined && item.droplet.value !== undefined) {
                description = description.gsub("%%val%%", this.formatPrice(item.droplet.value))[0];
            }
        }
        else if (item.isA("Generator")) {
            if (item.passiveGain !== undefined)
                description = description.gsub("%%gain%%", this.formatPrice(item.passiveGain, undefined, "/s"))[0];
        }
        if (item.drain !== undefined)
            description = description.gsub("%%drain%%", this.formatPrice(item.drain, undefined, "/s"))[0];
        if (item.formulaXCap !== undefined)
            description = description.gsub("%%cap%%", this.formatPrice(item.formulaXCap))[0];
        return formatRichText(description, this.descColor, size, weight);
    }

    formatMetadata(item: Item, description: string, size: number, weight: string | number, multiplier?: OnoeNum) {
        let builder = new StringBuilder(description);
        if (item.isA("HarvestingTool")) {
            builder = builder.append("\n").append(this.formatTool(item, size, weight));
        }
        else {
            const hasFormula = item.formula !== undefined;
            const hasSlamoVillage = AREAS.SlamoVillage.unlocked.Value === true;
            if (hasFormula || hasSlamoVillage) {
                builder = builder.append(`\n<font size="7"> </font>`);
            }
            if (hasFormula)
                builder = builder.append(`\n${this.formatFormula(item, multiplier ?? this.boostPerItem.get(item.id), size, weight)}`);
            if ((item.placeableAreas.isEmpty() || hasSlamoVillage) && item.bounds === undefined)
                builder = builder.append(`\n${this.formatPlaceableAreas(item, size, weight)}`);
            if (hasSlamoVillage)
                builder = builder.append(`\n${this.formatResettingAreas(item, size, weight)}`);
        }
        if (item.levelReq !== undefined)
            builder = builder.append(`\n${formatRichText("Lv. Min: " + item.levelReq,
                item.levelReq > Packets.level.get() ? Color3.fromRGB(255, 105, 105) : Color3.fromRGB(125, 255, 125), size, weight)}`);
        return builder.toString();
    }

    onInit() {
        Packets.boostChanged.connect((value) => this.boostPerItem = value);
        for (const [_id, item] of Items.itemsPerId) {
            let description = item.description;
            if (description !== undefined) {
                for (const [currency, details] of pairs(Price.DETAILS_PER_CURRENCY)) {
                    [description] = description!.gsub(currency, `<font color="#${details.color.ToHex()}">${currency}</font>`);
                }
                item.description = description;
            }
            if (item.isA("Condenser")) {
                let val = new Price();
                for (const [droplet] of item.quotasPerDroplet) {
                    val = val.add(droplet.value);
                }
                this.valsPerCondenser.set(item, this.formatPrice(val));
            }
        }
    }
}