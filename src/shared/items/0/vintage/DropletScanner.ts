//!native
//!optimize 2
import { buildRichText, formatRichText, getInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import { packet } from "@rbxts/fletchette";
import { OnoeNum } from "@rbxts/serikanum";
import StringBuilder from "@rbxts/stringbuilder";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_CATEGORIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import perItemPacket from "shared/item/utils/perItemPacket";
import Class0Shop from "shared/items/0/Class0Shop";

const textChangedPacket =
    perItemPacket(packet<(placementId: string, dropletId: string, value: string, color: string) => void>());

const ALL_CURRENCIES_COLOR = new Color3(0.3, 0.37, 1);

function getOperationString(constant: OnoeNum, operation: "add" | "mul" | "pow") {
    switch (operation) {
        case "add":
            if (constant.moreThan(0)) {
                return $tuple("+", constant);
            } else if (constant.lessThan(0)) {
                return $tuple("-", constant.abs());
            }
            return $tuple("", constant);
        case "mul":
            if (constant.moreThan(1)) {
                return $tuple("x", constant);
            } else if (constant.lessThan(1)) {
                return $tuple("÷", constant.reciprocal());
            }
            return $tuple("", constant);
        case "pow":
            if (constant.moreThan(1)) {
                return $tuple("^", constant);
            } else if (constant.lessThan(1)) {
                return $tuple("√", constant.reciprocal());
            }
            return $tuple("", constant);
    }
}

function valueToString(builder: StringBuilder, constant: OnoeNum | CurrencyBundle, operation: "add" | "mul" | "pow") {
    if ("mantissa" in constant) {
        const [opString, opValue] = getOperationString(constant, operation);
        buildRichText(builder, opString + opValue.toString(), ALL_CURRENCIES_COLOR, undefined, "Bold");
        return;
    }

    currenciesToString(builder, constant.amountPerCurrency, "mul");
}

function currenciesToString(builder: StringBuilder, amountPerCurrency: CurrencyMap, operation: "add" | "mul" | "pow") {
    let i = 1;
    const size = amountPerCurrency.size();
    const last = size - 1;
    for (const [name, details] of CurrencyBundle.SORTED_DETAILS) {
        if (details.page === CURRENCY_CATEGORIES.Internal) continue;

        let amount = amountPerCurrency.get(name);
        if (amount === undefined) continue;

        const [opString, opValue] = getOperationString(amount, operation);

        buildRichText(builder, opString + CurrencyBundle.getFormatted(name, opValue), details.color, undefined, "Bold");

        if (i < size) {
            builder.append(i === last ? " and " : ", ");
        }
        i++;
    }
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
        const RevenueService = Server.Revenue;

        getInstanceInfo(model, "OnUpgraded")!.connect((dropletModel) => {
            const dropletValue = RevenueService.calculateDropletValue(dropletModel, true);
            dropletValue.applyFinal();
            dropletValue.applySource();

            const builder = new StringBuilder();
            builder.append("RAW WORTH: ").append(dropletValue.baseValue.toString(true));

            for (const [name, operative] of dropletValue.factors) {
                builder.append("\n").append(name.upper()).append(": ");

                if (operative.add !== undefined) {
                    valueToString(builder, operative.add, "add");
                }

                if (operative.mul !== undefined) {
                    valueToString(builder, operative.mul, "mul");
                }

                if (operative.pow !== undefined) {
                    valueToString(builder, operative.pow, "pow");
                }
            }

            const health = getInstanceInfo(dropletModel, "Health")!;
            if (health !== 100) {
                builder
                    .append("\nHEALTH: ")
                    .append(formatRichText(OnoeNum.toString(health), CURRENCY_DETAILS.Health.color));
            }

            builder.append("\nTOTAL: ").append(dropletValue.coalesce().toString(true));
            textChangedPacket.toAllClients(
                model,
                dropletValue.instanceInfo.DropletId!,
                builder.toString(),
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
