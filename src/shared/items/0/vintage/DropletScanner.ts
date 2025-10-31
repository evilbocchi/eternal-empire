//!native
//!optimize 2
import { buildRichText, formatRichText, getAllInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import { packet } from "@rbxts/fletchette";
import { OnoeNum } from "@rbxts/serikanum";
import StringBuilder from "@rbxts/stringbuilder";
import { Server } from "shared/api/APIExpose";
import { IS_EDIT } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_CATEGORIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import perItemPacket from "shared/item/utils/perItemPacket";
import Class0Shop from "shared/items/0/Class0Shop";

declare global {
    interface InstanceInfo {
        /**
         * The last scanned droplet text output (only populated in edit mode for testing).
         */
        scannerOutput?: string;
    }
}

const textChangedPacket =
    perItemPacket(packet<(placementId: string, dropletId: string, value: string, color: string) => void>());

const ALL_CURRENCIES_COLOR = new Color3(0.3, 0.37, 1);
const ZERO = new OnoeNum(0);
const ONE = new OnoeNum(1);

function isNeutralValue(constant: OnoeNum, operation: "add" | "mul" | "pow") {
    switch (operation) {
        case "add":
            return constant.equals(ZERO);
        case "mul":
        case "pow":
            return constant.equals(ONE);
    }
}

function getOperationString(constant: OnoeNum, operation: "add" | "mul" | "pow", inverse: boolean) {
    switch (operation) {
        case "add":
            if (inverse) {
                constant = constant.unary();
            }
            if (constant.moreThan(0)) {
                return $tuple("+", constant);
            } else if (constant.lessThan(0)) {
                return $tuple("-", constant.abs());
            }
            return $tuple("", constant.abs());
        case "mul":
            if (constant.moreThan(1)) {
                if (inverse) {
                    return $tuple("÷", constant);
                }
                return $tuple("x", constant);
            } else if (constant.lessThan(1)) {
                if (inverse) {
                    return $tuple("x", constant.reciprocal());
                }
                return $tuple("÷", constant.reciprocal());
            }
            return $tuple("", constant);
        case "pow":
            if (constant.moreThan(1)) {
                if (inverse) {
                    return $tuple("√", constant);
                }
                return $tuple("^", constant);
            } else if (constant.lessThan(1)) {
                if (inverse) {
                    return $tuple("^", constant.reciprocal());
                }
                return $tuple("√", constant.reciprocal());
            }
            return $tuple("", constant);
    }
}

function valueToString(
    builder: StringBuilder,
    constant: OnoeNum | CurrencyBundle,
    operation: "add" | "mul" | "pow",
    inverse: boolean,
) {
    if ("mantissa" in constant) {
        if (isNeutralValue(constant, operation)) return false;
        const [opString, opValue] = getOperationString(constant, operation, inverse);
        buildRichText(builder, opString + opValue.toString(), ALL_CURRENCIES_COLOR, undefined, "Bold");
        return true;
    }

    return currenciesToString(builder, constant.amountPerCurrency, operation, inverse);
}

function currenciesToString(
    builder: StringBuilder,
    amountPerCurrency: CurrencyMap,
    operation: "add" | "mul" | "pow",
    inverse: boolean,
) {
    let hasAnyValues = false;
    const entries = new Array<{ name: Currency; details: CurrencyDetails; amount: OnoeNum }>();

    for (const [name, details] of CurrencyBundle.SORTED_DETAILS) {
        if (details.page === CURRENCY_CATEGORIES.Internal) continue;

        let amount = amountPerCurrency.get(name);
        if (amount === undefined || isNeutralValue(amount, operation)) continue;

        entries.push({ name, details, amount });
        hasAnyValues = true;
    }

    if (!hasAnyValues) return false;

    for (let i = 0; i < entries.size(); i++) {
        const { name, details, amount } = entries[i];
        const [opString, opValue] = getOperationString(amount, operation, inverse);

        buildRichText(builder, opString + CurrencyBundle.getFormatted(name, opValue), details.color, undefined, "Bold");

        if (i < entries.size() - 1) {
            builder.append(i === entries.size() - 2 ? " and " : ", ");
        }
    }

    return true;
}

export = new Item(script.Name)
    .setName("Droplet Scanner")
    .setDescription(
        "Outputs the value of droplets passing through the scanner, showing the details of each upgrade it has received.",
    )
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new CurrencyBundle().set("Power", 1e18).set("Bitcoin", 10000), 1, 5)
    .placeableEverywhere()
    .soldAt(Class0Shop)
    .persists()

    .trait(Upgrader)
    .exit()

    .onLoad((model, item) => {
        const modelInfo = getAllInstanceInfo(model);

        const onUpgraded = modelInfo.upgraderTriggered;
        if (onUpgraded === undefined)
            throw `Tried to load Droplet Scanner on model without OnUpgraded event: ${model.GetFullName()}`;

        onUpgraded.connect((dropletModel) => {
            const dropletValue = Server.Revenue.calculateDropletValue(dropletModel, true);
            dropletValue.applyFinal();
            dropletValue.applySource();

            const builder = new StringBuilder();
            builder.append("RAW WORTH: ").append(dropletValue.baseValue.toString(true));

            for (const [name, operative] of dropletValue.factors) {
                const inverse = operative.inverse === true;
                let hasAnyContent = false;
                const contentBuilder = new StringBuilder();

                if (operative.add !== undefined) {
                    if (valueToString(contentBuilder, operative.add, "add", inverse)) {
                        hasAnyContent = true;
                    }
                }

                if (operative.mul !== undefined) {
                    if (hasAnyContent) contentBuilder.append(" ");
                    if (valueToString(contentBuilder, operative.mul, "mul", inverse)) {
                        hasAnyContent = true;
                    }
                }

                if (operative.pow !== undefined) {
                    if (hasAnyContent) contentBuilder.append(" ");
                    if (valueToString(contentBuilder, operative.pow, "pow", inverse)) {
                        hasAnyContent = true;
                    }
                }

                if (hasAnyContent) {
                    builder.append("\n").append(name.upper()).append(": ").append(contentBuilder.toString());
                }
            }

            const dropletModelInfo = getAllInstanceInfo(dropletModel);
            const health = dropletModelInfo.health;
            if (health !== 100 && health !== undefined) {
                builder
                    .append("\nHEALTH: ")
                    .append(formatRichText(OnoeNum.toString(health), CURRENCY_DETAILS.Health.color));
            }

            builder.append("\nTOTAL: ").append(dropletValue.coalesce().toString(true));

            const outputText = builder.toString();

            // Expose output in edit mode for testing
            if (IS_EDIT) {
                modelInfo.scannerOutput = outputText;
            }

            textChangedPacket.toAllClients(
                model,
                dropletValue.instanceInfo.dropletId!,
                outputText,
                dropletModel.Color.Lerp(new Color3(1, 1, 1), 0.2).ToHex(),
            );
        });
    })
    .onClientLoad((model) => {
        const titleLabel = model
            .WaitForChild("TitlePart")
            .WaitForChild("SurfaceGui")
            .WaitForChild("TextLabel") as TextLabel;
        const valueLabel = model
            .WaitForChild("ValuePart")
            .WaitForChild("SurfaceGui")
            .WaitForChild("ScrollingFrame")
            .WaitForChild("TextLabel") as TextLabel;
        let titleText = "NOTHING READ";
        let valueText = "NO WORTH";
        titleLabel.Text = titleText;
        valueLabel.Text = valueText;

        textChangedPacket.fromServer(model, (dropletId, value, color) => {
            titleText = `LAST READ:\n<font color="#${color}">${dropletId.upper()}</font>`;
            valueText = value;
            if (titleLabel !== undefined) titleLabel.Text = titleText;
            if (valueLabel !== undefined) valueLabel.Text = valueText;
        });
    });
