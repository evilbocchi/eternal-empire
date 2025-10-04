import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { buildRichText, combineHumanReadable, formatRichText } from "@antivivi/vrldk";
import StringBuilder from "@rbxts/stringbuilder";
import { IS_SERVER } from "shared/Context";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import Item from "shared/item/Item";
import Unique from "shared/item/traits/Unique";
import Items from "shared/items/Items";

let RESET_LAYERS_UNLOCKED = false;

export default class ItemMetadata {
    static readonly DESCRIPTION_PER_ITEM = (() => {
        const map = new Map<Item, string>();
        for (const [, item] of Items.itemsPerId) {
            map.set(item, this.formatCurrencyColors(item.description));
        }
        return map;
    })();

    static readonly INDICES = {
        TOOL: 0,
        SPACING: 1,
        FORMULA: 2,
        PLACEABLE_AREAS: 3,
        RESET_LAYER: 4,
        LEVEL_REQ: 5,
    };

    builder = new StringBuilder();
    formulaOperation = "x";

    constructor(
        public item: Item,
        public size = 15,
        public weight: keyof typeof Enum.FontWeight = "Medium",
    ) {
        for (const [_, value] of pairs(ItemMetadata.INDICES)) {
            this.builder[value] = "";
        }
        this.tool();
        this.spacing();
        this.formula();
        this.placeableAreas();
        this.resetLayer();
    }

    tool() {
        const tool = this.item.findTrait("Gear");
        if (tool === undefined || tool.type === "None") {
            this.builder[ItemMetadata.INDICES.TOOL] = "";
            return;
        }

        const speed = formatRichText(`\nSpeed: ${tool.speed}`, Color3.fromRGB(112, 176, 255), this.size, this.weight);
        const damage = formatRichText(`\nDamage: ${tool.damage}`, Color3.fromRGB(255, 71, 0), this.size, this.weight);

        this.builder[ItemMetadata.INDICES.TOOL] = speed + damage;
    }

    spacing() {
        if (this.item.formula !== undefined || RESET_LAYERS_UNLOCKED) {
            this.builder[ItemMetadata.INDICES.SPACING] = `\n<font size="7"> </font>`;
        } else {
            this.builder[ItemMetadata.INDICES.SPACING] = "";
        }
    }

    formula(color = Color3.fromRGB(126, 255, 167), result?: BaseOnoeNum) {
        const item = this.item;
        const formula = item.formula;
        if (formula === undefined) {
            this.builder[ItemMetadata.INDICES.FORMULA] = "";
            return;
        }

        const builder = new StringBuilder();
        builder.append("Formula: ");
        builder.append(formula.tostring(item.formulaX ?? "x"));

        if (result !== undefined) {
            builder.append(" = ");
            builder.append(this.formulaOperation);
            builder.append(OnoeNum.toString(result));
        }
        const formulaBundled = item.findTrait("FormulaBundled");
        if (formulaBundled !== undefined) {
            builder.append("\nBoost Ratio: ");
            for (const [currency, details] of CurrencyBundle.SORTED_DETAILS) {
                const ratio = formulaBundled.ratio.get(currency);
                if (ratio === undefined || ratio === 0) {
                    continue;
                }
                const formatted = CurrencyBundle.getFormatted(currency, new OnoeNum(ratio));
                const colored = new StringBuilder(formatted);

                if (result !== undefined) {
                    const value = new OnoeNum(result).mul(ratio);
                    colored.append(" (");
                    colored.append(this.formulaOperation);
                    colored.append(value.toString());
                    colored.append(")");
                }
                buildRichText(builder, colored.toString(), details.color, this.size, this.weight);

                builder.append(" : ");
            }
            builder.pop(); // Remove the last " : "
        }

        const display = formatRichText(builder.toString(), color, this.size, this.weight);
        this.builder[ItemMetadata.INDICES.FORMULA] = display;
    }

    placeableAreas(color = Color3.fromRGB(248, 255, 221)) {
        const item = this.item;
        const isEmpty = item.placeableAreas.isEmpty();
        if (item.bounds !== undefined || (!RESET_LAYERS_UNLOCKED && !isEmpty)) {
            this.builder[ItemMetadata.INDICES.PLACEABLE_AREAS] = "";
            return;
        }

        if (isEmpty) {
            this.builder[ItemMetadata.INDICES.PLACEABLE_AREAS] =
                `\n${formatRichText("This item is not placeable.", color, this.size, this.weight)}`;
            return;
        }

        const builder = new StringBuilder("Placeable in ");
        const vals = new Array<string>();
        for (const area of item.placeableAreas) {
            if (area.hidden) continue;
            vals.push(area.name);
        }
        builder.append(combineHumanReadable(...vals));

        this.builder[ItemMetadata.INDICES.PLACEABLE_AREAS] =
            `\n${formatRichText(builder.toString(), color, this.size, this.weight)}`;
    }

    resetLayer(color = Color3.fromRGB(255, 156, 99)) {
        if (RESET_LAYERS_UNLOCKED === false) {
            this.builder[ItemMetadata.INDICES.RESET_LAYER] = "";
            return;
        }

        let text: string;
        const order = this.item.getResetLayer();
        if (order > 900) text = "[Persistent]";
        else {
            let layer: ResetLayerId | undefined;
            for (const [id, l] of pairs(RESET_LAYERS))
                if (l.order === order) {
                    layer = id;
                    break;
                }
            text = layer === undefined ? "[Persistent]" : `[Resets on ${layer}]`;
        }

        this.builder[ItemMetadata.INDICES.RESET_LAYER] = `\n${formatRichText(text, color, this.size, this.weight)}`;
    }

    /**
     * Append this metadata to the description.
     * @param description The existing description to append to.
     * @param color Optional color for the appended text.
     * @param size Optional font size.
     * @param weight Optional font weight.
     * @returns The combined rich text string.
     */
    private appendMetadata(
        description: string,
        color = Color3.fromRGB(195, 195, 195),
        size = 18,
        weight?: keyof typeof Enum.FontWeight | number,
    ) {
        const builder = buildRichText(undefined, description, color, size, weight);
        return builder.appendAll(this.builder).toString();
    }

    /**
     * Format an item's description with metadata appended.
     * @param uniqueInstance Optional unique item instance for trait formatting.
     * @param useTooltipDescription Whether to use the tooltip description if available.
     * @param color Optional color for the description text.
     * @param size Optional font size.
     * @param weight Optional font weight.
     * @returns The combined rich text string.
     */
    formatItemDescription(
        uniqueInstance?: UniqueItemInstance,
        useTooltipDescription?: boolean,
        color?: Color3,
        size?: number,
        weight?: keyof typeof Enum.FontWeight | number,
    ) {
        const description = ItemMetadata.formatDescription(this.item, uniqueInstance, useTooltipDescription);
        return this.appendMetadata(description, color, size, weight);
    }

    /**
     * Formats currency names in a string with their associated colors.
     * @param text The input text containing currency names.
     * @returns The text with currency names color-formatted.
     */
    static formatCurrencyColors(text: string) {
        for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
            [text] = text!.gsub(currency, `<font color="#${details.color.ToHex()}">${currency}</font>`);
        }
        return text;
    }

    /**
     * Formats an item's description, applying currency colors and unique instance traits if provided.
     * @param item The item whose description is to be formatted.
     * @param uniqueInstance Optional unique item instance for trait formatting.
     * @returns The formatted description string.
     */
    static formatDescription(item: Item, uniqueInstance?: UniqueItemInstance, useTooltipDescription?: boolean) {
        if (useTooltipDescription === true) {
            const tooltipDescription = item.tooltipDescription;
            if (tooltipDescription !== undefined) return tooltipDescription;
        }

        let description = ItemMetadata.DESCRIPTION_PER_ITEM.get(item);
        if (description === undefined) {
            description = this.formatCurrencyColors(item.description);
            ItemMetadata.DESCRIPTION_PER_ITEM.set(item, description);
        }
        if (uniqueInstance !== undefined) {
            description = item.trait(Unique).formatWithPots(description, uniqueInstance);
        }
        return item.format(description);
    }

    static {
        if (!IS_SERVER) {
            Packets.unlockedAreas.observe((areas) => {
                RESET_LAYERS_UNLOCKED = areas.has("SlamoVillage");
            });
        }
    }
}
