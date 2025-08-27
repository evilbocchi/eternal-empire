/**
 * @fileoverview Client controller for managing bomb-related UI and gameplay interactions.
 *
 * Handles:
 * - Setting up bomb board GUIs for purchasing and using bombs
 * - Integrating with UIController for sound feedback
 * - Observing and updating bomb balances
 * - Displaying active bomb timers in the details window
 *
 * The controller manages bomb board GUIs, listens for relevant events, and coordinates with other systems for bomb usage and purchases.
 *
 * @since 1.0.0
 */
import { OnoeNum } from "@antivivi/serikanum";
import { convertToHHMMSS } from "@antivivi/vrldk";
import { Controller, OnStart } from "@flamework/core";
import { CollectionService, MarketplaceService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { DETAILS_WINDOW } from "client/controllers/interface/DetailsController";
import { playSound } from "shared/asset/GameAssets";
import { BOMBS_PRODUCTS } from "shared/devproducts/BombsProducts";
import Packets from "shared/Packets";

declare global {
    type BombsBoardGui = SurfaceGui & {
        BuyButton: TextButton,
        UseButton: TextButton,
        AmountLabel: TextLabel,
    };
}

/**
 * Controller responsible for managing bomb board GUIs, bomb purchases, usage, and bomb-related UI updates.
 *
 * Integrates with UIController for sound, observes bomb balances, and updates the details window with bomb timers.
 */
@Controller()
export default class BombsController implements OnStart {

    /** Map of bomb board GUIs to their associated currency. */
    guis = new Map<BombsBoardGui, Currency>();

    /**
     * Sets up the bomb board GUI with purchase and use actions, and manages its lifecycle.
     * @param bombsCurrency The currency type for bombs.
     * @param boosting The currency type for boosting.
     * @param gui The bomb board GUI instance.
     */
    loadGui(bombsCurrency: Currency, boosting: Currency, gui: BombsBoardGui) {
        gui.BuyButton.Activated.Connect(() => {
            playSound("MenuClick.mp3");
            MarketplaceService.PromptProductPurchase(LOCAL_PLAYER, BOMBS_PRODUCTS[boosting as keyof (typeof BOMBS_PRODUCTS)]);
        });
        gui.UseButton.Activated.Connect(() => {
            if (Packets.useBomb.toServer(bombsCurrency) === true) {
                playSound("ItemPurchase.mp3");
            }
            else {
                playSound("Error.mp3");
            }
        });
        gui.Destroying.Once(() => this.guis.delete(gui));
        this.guis.set(gui, bombsCurrency);
    }

    /**
     * Initializes the BombsController, sets up listeners for bomb boards, balance updates, and bomb timers.
     */
    onStart() {
        CollectionService.GetInstanceAddedSignal("Bombs Board").Connect((board) => {
            const bombsCurrency = (board.WaitForChild("BombsCurrency") as StringValue).Value as Currency;
            const boosting = (board.WaitForChild("Boosting") as StringValue).Value as Currency;
            this.loadGui(bombsCurrency, boosting, board.WaitForChild("SurfaceGui") as BombsBoardGui);
        });

        Packets.balance.observe((value) => {
            for (const [gui, currency] of this.guis)
                gui.AmountLabel.Text = tostring(new OnoeNum(value.get(currency) ?? 0));
        });

        task.spawn(() => {
            while (task.wait(1)) {
                const currentTime = os.time();
                const fundsBombTime = Workspace.GetAttribute("FundsBombTime") as number | undefined;
                if (fundsBombTime === undefined || fundsBombTime < currentTime) {
                    DETAILS_WINDOW.FundsBombLabel.Visible = false;
                }
                else {
                    DETAILS_WINDOW.FundsBombLabel.Text = `Funds Bomb Active (x2): ${convertToHHMMSS(fundsBombTime - currentTime)}`;
                    DETAILS_WINDOW.FundsBombLabel.Visible = true;
                }
            }
        });
    }
}