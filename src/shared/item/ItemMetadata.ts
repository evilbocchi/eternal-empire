import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { buildRichText, combineHumanReadable, formatRichText } from "@antivivi/vrldk";
import StringBuilder from "@rbxts/stringbuilder";
import { AREAS } from "shared/Area";
import Packets from "shared/Packets";
import { RESET_LAYERS } from "shared/ResetLayer";
import Sandbox from "shared/Sandbox";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

const RESET_LAYERS_UNLOCKED = AREAS.SlamoVillage.unlocked;
const SANDBOX_ENABLED = Sandbox.getEnabled();

export default class ItemMetadata {

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

    constructor(public item: Item, public size = 15, public weight = "Medium") {
        for (const [_, value] of pairs(ItemMetadata.INDICES)) {
            this.builder[value] = "";
        }
        this.tool();
        this.spacing();
        this.formula();
        this.placeableAreas();
        this.resetLayer();
        this.levelReq();
    }

    tool() {
        const tool = this.item.findTrait("HarvestingTool");
        if (tool === undefined || tool.toolType === "None") {
            this.builder[ItemMetadata.INDICES.TOOL] = "";
            return;
        }

        const speed = formatRichText(`\nSpeed: ${tool.speed}`, Color3.fromRGB(112, 176, 255), this.size, this.weight);
        const damage = formatRichText(`\nDamage: ${tool.damage}`, Color3.fromRGB(255, 71, 0), this.size, this.weight);

        this.builder[ItemMetadata.INDICES.TOOL] = speed + damage;
    }

    spacing() {
        if (this.item.formula !== undefined || RESET_LAYERS_UNLOCKED.Value) {
            this.builder[ItemMetadata.INDICES.SPACING] = `\n<font size="7"> </font>`;
        }
        else {
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
        if (item.bounds !== undefined || (!RESET_LAYERS_UNLOCKED.Value && !isEmpty && !SANDBOX_ENABLED)) {
            this.builder[ItemMetadata.INDICES.PLACEABLE_AREAS] = "";
            return;
        }

        if (isEmpty) {
            this.builder[ItemMetadata.INDICES.PLACEABLE_AREAS] = `\n${formatRichText("This item is not placeable.", color, this.size, this.weight)}`;
            return;
        }

        const builder = new StringBuilder("Placeable in ");
        const vals = new Array<string>();
        for (const area of item.placeableAreas) {
            if (area.hidden && !SANDBOX_ENABLED)
                continue;
            vals.push(area.name);
        }
        builder.append(combineHumanReadable(...vals));

        this.builder[ItemMetadata.INDICES.PLACEABLE_AREAS] = `\n${formatRichText(builder.toString(), color, this.size, this.weight)}`;
    }

    resetLayer(color = Color3.fromRGB(255, 156, 99)) {
        if (RESET_LAYERS_UNLOCKED.Value === false) {
            this.builder[ItemMetadata.INDICES.RESET_LAYER] = "";
            return;
        }

        let text: string;
        const order = this.item.getResetLayer();
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

        this.builder[ItemMetadata.INDICES.RESET_LAYER] = `\n${formatRichText(text, color, this.size, this.weight)}`;
    }

    levelReq(level = Packets.level.get()) {
        const levelReq = this.item.levelReq;
        if (levelReq === undefined) {
            this.builder[ItemMetadata.INDICES.LEVEL_REQ] = "";
            return;
        }

        const color = levelReq < level ? Color3.fromRGB(125, 255, 125) : Color3.fromRGB(255, 105, 105);
        const text = `Lv. Min: ${levelReq}`;

        this.builder[ItemMetadata.INDICES.LEVEL_REQ] = `\n${formatRichText(text, color, this.size, this.weight)}`;
    }
}