import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";
import { AREAS } from "shared/Area";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CurrencyService } from "./serverdata/CurrencyService";

@Service()
export class DarkMatterService implements OnInit {

    boost = new CurrencyBundle();
    gui = AREAS.SlamoVillage.areaFolder.FindFirstChild("DarkMatter")?.FindFirstChild("SurfaceGui") as SurfaceGui | undefined;
    darkMatterLabel = this.gui?.WaitForChild("DarkMatterLabel") as TextLabel | undefined;
    fundsLabel = this.gui?.WaitForChild("FundsLabel") as TextLabel | undefined;
    powerLabel = this.gui?.WaitForChild("PowerLabel") as TextLabel | undefined;

    constructor(private currencyService: CurrencyService) {

    }

    getBoost(balance = this.currencyService.balance) {
        const darkMatter = balance.get("Dark Matter") ?? new OnoeNum(0);
        const boost = this.boost;
        boost.set("Funds", darkMatter.equals(0) ? 1 : OnoeNum.log(darkMatter.add(1), 11)?.pow(2).div(4.5).add(1.2));
        boost.set("Power", darkMatter.lessThan(1000) ? 1 : OnoeNum.log(darkMatter.div(1000), 11)?.pow(2).div(9).add(1.2));
        return $tuple(boost, darkMatter);
    }

    refreshGui(balance = this.currencyService.balance) {
        const [boost, darkMatter] = this.getBoost(balance);
        this.darkMatterLabel!.Text = tostring(darkMatter);
        const fundsBoost = boost.get("Funds");
        const powerBoost = boost.get("Power");

        this.fundsLabel!.Text = `${fundsBoost}x Funds`;

        const powerUnlocked = powerBoost?.moreThan(1) === true;
        this.powerLabel!.Text = powerUnlocked ? `${powerBoost}x Power` : `(${new OnoeNum(1000).sub(darkMatter)} more to unlock!)`;
        this.powerLabel!.TextSize = powerUnlocked ? 50 : 70;
    }

    onInit() {
        if (this.gui === undefined) // if the GUI is not found, do not continue
            return;
        task.spawn(() => {
            while (task.wait(1)) {
                this.refreshGui();
            }
        });
    }
}