import { OnStart, Service } from "@flamework/core";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import { OnoeNum } from "@antivivi/serikanum";
import { CurrencyService } from "./serverdata/CurrencyService";

@Service()
export class DarkMatterService implements OnStart {

    boost = new Price().setCost("Funds", new OnoeNum(1));
    gui = AREAS.SlamoVillage.areaFolder.WaitForChild("DarkMatter").WaitForChild("SurfaceGui");

    constructor(private currencyService: CurrencyService) {

    }

    onStart() {
        const darkMatterLabel = this.gui.WaitForChild("DarkMatterLabel") as TextLabel;
        const fundsLabel = this.gui.WaitForChild("FundsLabel") as TextLabel;
        const powerLabel = this.gui.WaitForChild("PowerLabel") as TextLabel;
        const balanceChanged = (balance: Map<Currency, OnoeNum>) => {
            const darkMatter = balance.get("Dark Matter");
            if (darkMatter === undefined) {
                return;
            }
            darkMatterLabel.Text = tostring(darkMatter);
            const fundsBoost = OnoeNum.log(darkMatter.add(1), 32)?.pow(1.1).add(1);
            const powerBoost = darkMatter.lessThan(1000) ? 1 : OnoeNum.log(darkMatter.div(1000), 32)?.pow(1.1).div(2).add(1);
            if (fundsBoost === undefined || powerBoost === undefined)
                return;
            this.boost.setCost("Funds", fundsBoost);
            this.boost.setCost("Power", powerBoost);

            fundsLabel.Text = `${fundsBoost}x Funds`;
            powerLabel.Text = powerBoost === 1 ? `(${new OnoeNum(1000).sub(darkMatter)} more to unlock!)` : `${powerBoost}x Power`;
            powerLabel.TextSize = powerBoost === 1 ? 50 : 70;
        }
        this.currencyService.balanceChanged.connect((balance) => balanceChanged(balance));
        balanceChanged(this.currencyService.getBalance().costPerCurrency);
    }
}