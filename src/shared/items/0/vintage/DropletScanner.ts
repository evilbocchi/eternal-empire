import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import { GameUtils } from "shared/utils/ItemUtils";
import StringBuilder from "shared/utils/StringBuilder";

export = new Upgrader(script.Name)
    .setName("Droplet Scanner")
    .setDescription("Outputs the value of droplets passing through the scanner, showing the details of each upgrade it has received.")
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new Price().setCost("Power", 1e18).setCost("Bitcoin", 10000), 1, 5)
    .markPlaceableEverywhere()
    .persists()

    .onLoad((model, item) => {
        const upgradedEvent = model.WaitForChild("UpgradedEvent") as BindableEvent;
        const remote = new Instance("RemoteEvent");
        remote.Parent = model;

        const RevenueService = GameUtils.revenueService;
        const removeOnes = (price: Price) => {
            const newPrice = new Price();
            for (const [currency, amount] of price.costPerCurrency) {
                if (!amount.equals(1)) {
                    newPrice.setCost(currency, amount);
                }
            }
            return newPrice;
        }
        const FURNACE_UPGRADES = NamedUpgrades.getUpgrades("Furnace");

        upgradedEvent.Event.Connect((droplet: BasePart) => {
            let [raw] = GameUtils.calculateDropletValue(droplet, false, false);
            const [globAdd, globMul, globPow] = RevenueService.applyGlobal(Price.EMPTY_PRICE, Price.ONES, Price.ONES, FURNACE_UPGRADES);
            const [total, additional] = GameUtils.calculateDropletValue(droplet, true, true);
            const builder = new StringBuilder();
            builder.append("RAW WORTH: ").append(raw.toString(undefined, undefined, true));
            const upgrades = GameUtils.getInstanceInfo(droplet, "Upgrades");
            
            let upgraded = false;
            if (upgrades !== undefined) {
                for (const [_id, upgradeInfo] of upgrades) {
                    upgraded = true;
                    if (upgradeInfo.UpgraderId === item.id)
                        continue;
                    const [add, mul, pow] = RevenueService.getUpgrade(upgradeInfo);

                    if (add === undefined && mul === undefined && pow === undefined)
                        continue;

                    builder.append("\n").append(upgradeInfo.UpgraderId.upper()).append(": ");
                    if (add !== undefined)
                        builder.append("+").append(add.toString(undefined, undefined, true));

                    if (mul !== undefined)
                        builder.append("x").append(mul.toString(undefined, undefined, true));

                    if (pow !== undefined)
                        builder.append("^").append(pow.toString(undefined, undefined, true));
                }
            }
            if (upgraded === false) {
                builder.append("\nNO UPGRADES");
            }
            const health = GameUtils.getInstanceInfo(droplet, "Health")!;
            if (health !== 100) {
                builder.append("\nHEALTH: ").append(OnoeNum.toString(health));
            }
            builder.append("\nGLOBAL BOOSTS: ");
            if (globAdd.costPerCurrency.size() > 0)
                builder.append("+").append(globAdd.toString(undefined, undefined, true));
            
            const washedMul = removeOnes(globMul);
            if (washedMul.costPerCurrency.size() > 0)
                builder.append("x").append(washedMul.toString(undefined, undefined, true));

            const washedPow = removeOnes(globPow);
            if (washedPow.costPerCurrency.size() > 0)
                builder.append("^").append(washedPow.toString(undefined, undefined, true));

            if (additional !== 1)
                builder.append("\nADDITIONAL: x").append(OnoeNum.toString(additional));

            builder.append("\nTOTAL: ").append(total.toString(undefined, undefined, true));

            remote.FireAllClients(GameUtils.getInstanceInfo(droplet, "DropletId"), builder.toString(), droplet.Color.Lerp(new Color3(1, 1, 1), 0.2).ToHex());
        });
    })
    .onClientLoad((model) => {
        const titleLabel = model.WaitForChild("TitlePart").WaitForChild("SurfaceGui").WaitForChild("TextLabel") as TextLabel;
        const valueLabel = model.WaitForChild("ValuePart").WaitForChild("SurfaceGui").WaitForChild("TextLabel") as TextLabel;
        (model.WaitForChild("RemoteEvent") as RemoteEvent).OnClientEvent.Connect((dropletId: string, value: string, color: string) => {
            titleLabel.Text = `LAST READ:\n<font color="#${color}">${dropletId.upper()}</font>`;
            valueLabel.Text = value;
        });
    });