//!native
//!optimize 2
import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { formatRichText, getAllInstanceInfo, getInstanceInfo, Streaming } from "@antivivi/vrldk";
import StringBuilder from "@rbxts/stringbuilder";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import { Server } from "shared/item/ItemUtils";
import Upgrader from "shared/item/traits/Upgrader";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

export = new Item(script.Name)
    .setName("Droplet Scanner")
    .setDescription("Outputs the value of droplets passing through the scanner, showing the details of each upgrade it has received.")
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new CurrencyBundle().set("Power", 1e18).set("Bitcoin", 10000), 1, 5)
    .placeableEverywhere()
    .persists()

    .trait(Upgrader)
    .exit()

    .onLoad((model, item) => {
        const fireTextRemote = Streaming.createStreamableRemote(model);

        const RevenueService = Server.Revenue;
        const removeOnes = (price: CurrencyBundle) => {
            const newPrice = new CurrencyBundle();
            for (const [currency, amount] of price.amountPerCurrency) {
                if (!amount.equals(1)) {
                    newPrice.set(currency, amount);
                }
            }
            return newPrice;
        };
        const FURNACE_UPGRADES = NamedUpgrades.getUpgrades("Furnace");

        const addOperationToBuilder = (builder: StringBuilder, normal: string, inverted: string, operation?: CurrencyBundle, inverse?: boolean) => {
            if (operation !== undefined) {
                if (operation.hasAll()) {
                    const all = OnoeNum.toString(operation.getFirst()[1]!);
                    builder.append(inverse ? inverted : normal).append(formatRichText(all, new Color3(0.3, 0.37, 1)));
                    return;
                }
                builder.append(inverse ? inverted : normal).append(operation.toString(true));
            }
        };

        getInstanceInfo(model, "OnUpgraded")!.connect((dropletModel) => {
            const dropletInfo = getAllInstanceInfo(dropletModel);
            const dropletId = dropletInfo.DropletId!;
            const droplet = Droplet.getDroplet(dropletId)!;
            const rawValue = droplet.value;

            const [globAdd, globMul, globPow] = RevenueService.getGlobal(FURNACE_UPGRADES);
            const [total, nerf] = RevenueService.calculateDropletValue(dropletModel, true, true);

            const builder = new StringBuilder();
            builder.append("RAW WORTH: ").append(rawValue.toString(true));
            const upgrades = dropletInfo.Upgrades;

            let upgraded = false;
            if (upgrades !== undefined) {
                for (const [upgradeId, upgradeInfo] of upgrades) {
                    upgraded = true;
                    const upgraderId = upgradeInfo.Stats?.item.id ?? upgradeId;
                    if (upgraderId === item.id)
                        continue;

                    const [add, mul, pow, inverse] = Upgrader.getUpgrade(upgradeInfo);
                    if ((upgradeInfo.EmptyUpgrade && !inverse) || (add === undefined && mul === undefined && pow === undefined))
                        continue;

                    builder.append("\n").append(upgraderId.upper()).append(": ");
                    addOperationToBuilder(builder, "+", "-", add, inverse);
                    addOperationToBuilder(builder, "x", "/", mul, inverse);
                    addOperationToBuilder(builder, "^", "rt", pow, inverse);
                }
            }
            if (upgraded === false) {
                builder.append("\nNO UPGRADES");
            }
            const health = getInstanceInfo(dropletModel, "Health")!;
            if (health !== 100) {
                builder.append("\nHEALTH: ").append(formatRichText(OnoeNum.toString(health), CURRENCY_DETAILS.Health.color));
            }
            builder.append("\nGLOBAL BOOSTS: ");
            if (globAdd.amountPerCurrency.size() > 0)
                builder.append("+").append(globAdd.toString(true));

            const washedMul = removeOnes(globMul);
            if (washedMul.amountPerCurrency.size() > 0)
                builder.append("x").append(washedMul.toString(true));

            const washedPow = removeOnes(globPow);
            if (washedPow.amountPerCurrency.size() > 0)
                builder.append("^").append(washedPow.toString(true));

            if (nerf !== 1)
                builder.append("\nNERF: /").append(OnoeNum.toString(1 / nerf));

            builder.append("\nTOTAL: ").append(total.toString(true));

            fireTextRemote(dropletId, builder.toString(), dropletModel.Color.Lerp(new Color3(1, 1, 1), 0.2).ToHex());
        });
    })
    .onClientLoad((model) => {
        let titleLabel: TextLabel | undefined;
        let valueLabel: TextLabel | undefined;
        let titleText = "NOTHING READ";
        let valueText = "NO WORTH";
        Streaming.onModelStreamIn(model, () => {
            titleLabel = model.WaitForChild("TitlePart").WaitForChild("SurfaceGui").WaitForChild("TextLabel") as TextLabel;
            valueLabel = model.WaitForChild("ValuePart").WaitForChild("SurfaceGui").WaitForChild("ScrollingFrame").WaitForChild("TextLabel") as TextLabel;
            titleLabel.Text = titleText;
            valueLabel.Text = valueText;
        });

        Streaming.onStreamableRemote(model, (dropletId: string, value: string, color: string) => {
            titleText = `LAST READ:\n<font color="#${color}">${dropletId.upper()}</font>`;
            valueText = value;
            if (titleLabel !== undefined)
                titleLabel.Text = titleText;
            if (valueLabel !== undefined)
                valueLabel.Text = valueText;
        });
    });