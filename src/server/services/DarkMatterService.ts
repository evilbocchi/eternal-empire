import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import { CurrencyService } from "./serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";

@Service()
export class DarkMatterService implements OnInit {

    boost = new Price().setCost("Funds", new OnoeNum(1));
    gui = AREAS.SlamoVillage.areaFolder.WaitForChild("DarkMatter").WaitForChild("SurfaceGui");

    constructor(private dataService: DataService, private currencyService: CurrencyService) {

    }

    onInit() {
        const darkMatterLabel = this.gui.WaitForChild("DarkMatterLabel") as TextLabel;
        const fundsLabel = this.gui.WaitForChild("FundsLabel") as TextLabel;
        const powerLabel = this.gui.WaitForChild("PowerLabel") as TextLabel;
        const balanceChanged = (balance: Map<Currency, OnoeNum>) => {
            const darkMatter = balance.get("Dark Matter") ?? new OnoeNum(0);
            darkMatterLabel.Text = tostring(darkMatter);
            const fundsBoost = darkMatter.equals(0) ? 1 : OnoeNum.log(darkMatter.add(1), 11)?.pow(2).div(4.5).add(1.2);
            const powerBoost = darkMatter.lessThan(1000) ? 1 : OnoeNum.log(darkMatter.div(1000), 11)?.pow(2).div(9).add(1.2);
            if (fundsBoost === undefined || powerBoost === undefined)
                return;
            this.boost.setCost("Funds", fundsBoost);
            this.boost.setCost("Power", powerBoost);

            fundsLabel.Text = `${fundsBoost}x Funds`;
            powerLabel.Text = powerBoost === 1 ? `(${new OnoeNum(1000).sub(darkMatter)} more to unlock!)` : `${powerBoost}x Power`;
            powerLabel.TextSize = powerBoost === 1 ? 50 : 70;
        }
        this.currencyService.balanceChanged.connect((balance) => balanceChanged(balance));
        balanceChanged(this.dataService.empireData.currencies);
    }
}