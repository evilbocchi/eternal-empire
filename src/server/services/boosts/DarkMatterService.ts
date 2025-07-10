/**
 * @fileoverview Handles Dark Matter boosts and GUI updates.
 *
 * This service provides:
 * - Calculating currency boosts based on Dark Matter amount
 * - Updating the in-game GUI to reflect current boosts
 * - Periodically refreshing the GUI for real-time feedback
 *
 * @since 1.0.0
 */

import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import CurrencyService from "server/services/serverdata/CurrencyService";
import { AREAS } from "shared/Area";
import CurrencyBundle from "shared/currency/CurrencyBundle";

/**
 * Service that manages Dark Matter boosts and GUI updates.
 */
@Service()
export default class DarkMatterService implements OnInit {

    /** CurrencyBundle storing calculated boosts. */
    boost = new CurrencyBundle();

    /** Reference to the SurfaceGui for Dark Matter display. */
    gui = AREAS.SlamoVillage.areaFolder.FindFirstChild("DarkMatter")?.FindFirstChild("SurfaceGui") as SurfaceGui | undefined;

    /** Label displaying the current Dark Matter amount. */
    darkMatterLabel = this.gui?.WaitForChild("DarkMatterLabel") as TextLabel | undefined;

    /** Label displaying the current Funds boost. */
    fundsLabel = this.gui?.WaitForChild("FundsLabel") as TextLabel | undefined;

    /** Label displaying the current Power boost. */
    powerLabel = this.gui?.WaitForChild("PowerLabel") as TextLabel | undefined;

    constructor(private currencyService: CurrencyService) {

    }

    /**
     * Calculates the boost values for Funds and Power based on Dark Matter.
     * Uses logarithmic scaling for diminishing returns.
     *
     * @param balance The currency bundle to use (defaults to current balance).
     * @returns Tuple of (boost bundle, dark matter amount).
     */
    getBoost(balance = this.currencyService.balance) {
        const darkMatter = balance.get("Dark Matter") ?? new OnoeNum(0);
        const boost = this.boost;
        boost.set("Funds", darkMatter.equals(0) ? 1 : OnoeNum.log(darkMatter.add(1), 11)?.pow(2).div(4.5).add(1.2));
        boost.set("Power", darkMatter.lessThan(1000) ? 1 : OnoeNum.log(darkMatter.div(1000), 11)?.pow(2).div(9).add(1.2));
        return $tuple(boost, darkMatter);
    }

    /**
     * Updates the GUI labels to reflect current Dark Matter and boosts.
     *
     * @param balance The currency bundle to use (defaults to current balance).
     */
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

    /**
     * Initializes the service and starts periodic GUI refresh if the GUI exists.
     */
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