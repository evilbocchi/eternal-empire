//!native
//!optimize 2

/**
 * @fileoverviewrelated game events and boosts.
 *
 * This service handles:
 * - Bomb activation and timing
 * - Bomb usage permissions and debouncing
 * - Global bomb state synchronization via MessagingService
 * - Currency deduction for bomb usage
 *
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { convertToHHMMSS } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import { DataStoreService, MessagingService, Workspace } from "@rbxts/services";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import ChatHookService from "server/services/permissions/ChatHookService";
import ProductService from "server/services/product/ProductService";
import Packets from "shared/Packets";
import { getNameFromUserId } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { BOMBS_PRODUCTS } from "shared/devproducts/BombsProducts";

/**
 * Structure for bomb event messages sent via MessagingService.
 */
interface BombMessage {
    /**
     * Type of the bomb being used.
     */
    bombType: Currency;

    /**
     * ID of the player using the bomb.
     */
    player: number;

    /**
     * End time for the bomb effect.
     */
    endTime: number;
}

/**
 * Service that manages bomb boosts, usage, and global bomb state.
 */
@Service()
export default class BombsService implements OnInit, OnStart {
    /** Global DataStore for bomb timing. */
    globalDataStore = DataStoreService.GetGlobalDataStore();

    /** Signal fired when a bomb is used. */
    bombUsed = new Signal<(player: Player, bombType: Currency) => void>();

    /** Debounce timer to prevent rapid bomb usage. */
    debounce = 0;

    /** Whether the Funds Bomb is currently enabled. */
    fundsBombEnabled = false;
    /** Currency boost applied when Funds Bomb is active. */
    fundsBombBoost = new CurrencyBundle().set("Funds", 2);

    constructor(
        private chatHookService: ChatHookService,
        private currencyService: CurrencyService,
        private dataService: DataService,
        private productService: ProductService,
    ) {}

    /**
     * Refreshes the enabled state of the Funds Bomb based on current time and stored end time.
     */
    refreshBombsEnabled() {
        const currentTime = os.time();
        const fundsBombTime = Workspace.GetAttribute("FundsBombTime") as number | undefined;
        this.fundsBombEnabled = fundsBombTime !== undefined && fundsBombTime > currentTime;
    }

    /**
     * Initializes bomb usage packet handler and permissions.
     * Handles bomb activation, debouncing, and currency deduction.
     */
    onInit() {
        Packets.useBomb.fromClient((player, bombType) => {
            if (!this.dataService.checkPermLevel(player, "purchase")) {
                return false;
            }

            if (this.currencyService.get(bombType).lessEquals(0) || tick() - this.debounce < 1) {
                return false;
            }

            this.debounce = tick();
            if (bombType === "Funds Bombs") {
                this.bombUsed.fire(player, bombType);
                this.globalDataStore.UpdateAsync("Funds", (oldValue: number | undefined) => {
                    let base = os.time();
                    let value: number;

                    const amount = this.currencyService.get(bombType);
                    if (amount.lessEquals(0)) {
                        value = base;
                    } else {
                        if (oldValue !== undefined && oldValue > base) base = oldValue;

                        value = base + 15 * 60;
                        const msg = {
                            bombType: bombType,
                            player: player.UserId,
                            endTime: value,
                        };
                        this.updateBomb(msg);
                        task.spawn(() => {
                            MessagingService.PublishAsync("Bomb", msg);
                        });
                        this.currencyService.set(bombType, amount.sub(1));
                    }

                    return $tuple(value);
                });
                return true;
            }
            return false;
        });

        for (const [currency, bombProduct] of pairs(BOMBS_PRODUCTS)) {
            this.productService.setProductFunction(bombProduct, () => {
                this.currencyService.increment((currency + " Bombs") as Currency, new OnoeNum(4));
                return Enum.ProductPurchaseDecision.PurchaseGranted;
            });
        }
    }

    /**
     * Updates the global bomb state and notifies listeners.
     *
     * @param data Bomb message containing type, player, and end time.
     */
    updateBomb(data: BombMessage) {
        if (data.bombType === "Funds Bombs") {
            Workspace.SetAttribute("FundsBombTime", data.endTime);
            this.chatHookService.sendServerMessage(
                getNameFromUserId(data.player) +
                    " just activated a " +
                    data.bombType +
                    " for " +
                    convertToHHMMSS(data.endTime - os.time()) +
                    "!",
            );
            this.refreshBombsEnabled();
        }
    }

    /**
     * Starts bomb state synchronization and periodic refresh.
     * Subscribes to bomb events and updates bomb enabled state every second.
     */
    onStart() {
        Workspace.SetAttribute("FundsBombTime", this.globalDataStore.GetAsync("Funds")[0] as number | undefined);
        task.spawn(() => {
            while (task.wait(1)) {
                this.refreshBombsEnabled();
            }
        });

        this.refreshBombsEnabled();

        MessagingService.SubscribeAsync("Bomb", (message) => this.updateBomb(message.Data as BombMessage));
    }
}
