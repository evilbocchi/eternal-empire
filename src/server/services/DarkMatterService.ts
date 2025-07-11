import { OnStart, Service } from "@flamework/core";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { CurrencyService } from "./serverdata/CurrencyService";
import { AREAS } from "shared/constants";
import Price from "shared/Price";

@Service()
export class DarkMatterService implements OnStart {

    boost = new Price().setCost("Funds", new InfiniteMath(1));
    gui = AREAS.SlamoVillage.areaFolder.WaitForChild("DarkMatter").WaitForChild("SurfaceGui");

    constructor(private currencyService: CurrencyService) {

    }

    onStart() {
        const darkMatterLabel = this.gui.WaitForChild("DarkMatterLabel") as TextLabel;
        const boostLabel = this.gui.WaitForChild("BoostLabel") as TextLabel;
        this.currencyService.balanceChanged.connect((balance: Map<Currency, InfiniteMath>) => {
            const darkMatter = balance.get("Dark Matter");
            if (darkMatter === undefined) {
                return;
            }
            darkMatterLabel.Text = tostring(darkMatter);
            const fundsBoost = InfiniteMath.log(darkMatter.add(1), 32).div(2).add(1);
            this.boost.setCost("Funds", fundsBoost);
            boostLabel.Text = `${fundsBoost}x.`;
        });
    }
}