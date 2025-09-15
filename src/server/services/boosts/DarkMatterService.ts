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
import CurrencyService from "server/services/data/CurrencyService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import DarkMatter from "shared/currency/mechanics/DarkMatter";
import { AREAS } from "shared/world/Area";

/**
 * Service that manages Dark Matter boosts and GUI updates.
 */
@Service()
export default class DarkMatterService implements OnInit {
    /** CurrencyBundle storing calculated boosts. */
    boost = new CurrencyBundle();

    /** Reference to the SurfaceGui for Dark Matter display. */
    gui = AREAS.SlamoVillage.areaFolder.FindFirstChild("DarkMatter")?.FindFirstChild("SurfaceGui") as
        | SurfaceGui
        | undefined;

    /** Label displaying the current Dark Matter amount. */
    darkMatterLabel = this.gui?.WaitForChild("DarkMatterLabel") as TextLabel | undefined;

    /** Label displaying the current Funds boost. */
    fundsLabel = this.gui?.WaitForChild("FundsLabel") as TextLabel | undefined;

    /** Label displaying the current Power boost. */
    powerLabel = this.gui?.WaitForChild("PowerLabel") as TextLabel | undefined;

    constructor(private currencyService: CurrencyService) {}

    /**
     * Updates the GUI labels to reflect current Dark Matter and boosts.
     *
     * @param balance The currency bundle to use (defaults to current balance).
     */
    refreshGui(balance = this.currencyService.balance) {
        const [boost, darkMatter] = DarkMatter.getBoost(balance);
        this.darkMatterLabel!.Text = tostring(darkMatter);
        const fundsBoost = boost?.get("Funds") ?? new OnoeNum(1);
        const powerBoost = boost?.get("Power") ?? new OnoeNum(1);

        this.fundsLabel!.Text = `${fundsBoost}x Funds`;

        const powerUnlocked = powerBoost?.moreThan(1) === true;
        this.powerLabel!.Text = powerUnlocked
            ? `${powerBoost}x Power`
            : `(${DarkMatter.BOOSTING_CURRENCIES.Power.requirement.sub(darkMatter)} more to unlock!)`;
        this.powerLabel!.TextSize = powerUnlocked ? 50 : 70;
    }

    /**
     * Initializes the service and starts periodic GUI refresh if the GUI exists.
     */
    onInit() {
        if (this.gui === undefined)
            // if the GUI is not found, do not continue
            return;
        task.spawn(() => {
            while (task.wait(1)) {
                this.refreshGui();
            }
        });
    }
}
