//!native
//!optimize 2
import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { formatRichText, getAllInstanceInfo, getInstanceInfo } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import StringBuilder from "@rbxts/stringbuilder";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import WeatherBoost from "shared/item/traits/boost/WeatherBoost";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import perItemPacket from "shared/item/utils/perItemPacket";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Class0Shop from "shared/items/0/Class0Shop";

const textChangedPacket =
    perItemPacket(packet<(placementId: string, dropletId: string, value: string, color: string) => void>());

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

        const addOperationToBuilder = (
            builder: StringBuilder,
            normal: string,
            inverted: string,
            operation?: CurrencyBundle,
            inverse?: boolean,
        ) => {
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

            // Get weather multipliers for display
            const weatherMultiplier = WeatherBoost.getDropletValueMultiplier(dropletModel);

            const builder = new StringBuilder();
            builder.append("RAW WORTH: ").append(rawValue.toString(true));
            const upgrades = dropletInfo.Upgrades;

            let upgraded = false;
            if (upgrades !== undefined) {
                for (const [upgradeId, upgradeInfo] of upgrades) {
                    upgraded = true;
                    const upgraderId = Server.Item.getPlacedItem(upgradeInfo.Upgrader.Name)?.item;
                    if (upgraderId === undefined || upgraderId === item.id) continue;

                    const [add, mul, pow, inverse] = Upgrader.getUpgrade(upgradeInfo);
                    if (
                        (upgradeInfo.EmptyUpgrade && !inverse) ||
                        (add === undefined && mul === undefined && pow === undefined)
                    )
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
                builder
                    .append("\nHEALTH: ")
                    .append(formatRichText(OnoeNum.toString(health), CURRENCY_DETAILS.Health.color));
            }
            builder.append("\nGLOBAL BOOSTS: ");
            if (globAdd.amountPerCurrency.size() > 0) builder.append("+").append(globAdd.toString(true));

            const washedMul = removeOnes(globMul);
            if (washedMul.amountPerCurrency.size() > 0) builder.append("x").append(washedMul.toString(true));

            const washedPow = removeOnes(globPow);
            if (washedPow.amountPerCurrency.size() > 0) builder.append("^").append(washedPow.toString(true));

            // Display weather effects
            if (weatherMultiplier !== 1) {
                builder.append("\nWEATHER: ");
                builder
                    .append("x")
                    .append(formatRichText(OnoeNum.toString(weatherMultiplier), new Color3(0.5, 0.8, 1)));
            }

            if (nerf !== 1) builder.append("\nNERF: /").append(OnoeNum.toString(1 / nerf));

            builder.append("\nTOTAL: ").append(total.toString(true));
            textChangedPacket.toAllClients(
                model,
                dropletId,
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
