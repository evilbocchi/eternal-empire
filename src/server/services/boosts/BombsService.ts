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
import { DataStoreService, MessagingService } from "@rbxts/services";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import ChatHookService from "server/services/permissions/ChatHookService";
import { log } from "server/services/permissions/LogService";
import ProductService from "server/services/product/ProductService";
import Packets from "shared/Packets";
import { getNameFromUserId } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import CurrencyBomb from "shared/currency/mechanics/CurrencyBomb";
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

    /** Current active bomb boosts per currency. */
    boost?: CurrencyBundle;

    constructor(
        private chatHookService: ChatHookService,
        private currencyService: CurrencyService,
        private dataService: DataService,
        private productService: ProductService,
    ) {}

    /**
     * Activates a bomb based on the received message.
     * Updates bomb end time and sends a server message.
     * @param data The bomb message containing bomb type, player ID, and end time.
     */
    activateBomb(data: BombMessage) {
        this.setBombEndTime(data.bombType, data.endTime);
        this.chatHookService.sendServerMessage(
            `${getNameFromUserId(data.player)} just activated a ${data.bombType} for ${convertToHHMMSS(data.endTime - os.time())}!`,
        );
    }

    /**
     * Sets the end time for a specific bomb type and updates the corresponding packet.
     * @param bombType The type of bomb (currency) to set the end time for.
     * @param endTime The end time (as a Unix timestamp) when the bomb effect will expire.
     */
    setBombEndTime(bombType: Currency, endTime: number) {
        const bombEndTimes = Packets.bombEndTimes.get();
        bombEndTimes.set(bombType, endTime);
        Packets.bombEndTimes.set(bombEndTimes);
    }

    /**
     * Builds the initial bomb end times from the global DataStore.
     */
    buildInitialBombTimes() {
        const bombEndTimes = new Map<Currency, number>();
        const bombs: Currency[] = ["Funds Bombs"];

        for (const bomb of bombs) {
            const endTime = this.globalDataStore.GetAsync(bomb)[0] as number | undefined;
            if (endTime !== undefined) {
                bombEndTimes.set(bomb, endTime);
            }
        }
        Packets.bombEndTimes.set(bombEndTimes);
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
                log({
                    time: tick(),
                    type: "Bomb",
                    player: player.UserId,
                    currency: bombType,
                    amount: 1,
                });
                this.globalDataStore.UpdateAsync(bombType, (oldValue: number | undefined) => {
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
                        this.activateBomb(msg);
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
                this.currencyService.increment(currency, new OnoeNum(4));
                return Enum.ProductPurchaseDecision.PurchaseGranted;
            });
        }

        MessagingService.SubscribeAsync("Bomb", (message) => this.activateBomb(message.Data as BombMessage));
    }

    onStart() {
        task.spawn(() => {
            while (task.wait(1)) {
                this.boost = CurrencyBomb.getBombBoosts(Packets.bombEndTimes.get(), os.time());
            }
        });

        this.buildInitialBombTimes();
    }
}
