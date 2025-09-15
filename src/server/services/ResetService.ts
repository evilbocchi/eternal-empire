/**
 * @fileoverview Handles all logic related to game resets and prestige layers.
 *
 * This service manages:
 * - Determining which items, currencies, and upgrades are reset or kept per layer
 * - Performing the reset process, including inventory and world item management
 * - Calculating reset rewards based on player progress and upgrades
 * - Integrating with UI and touch interactions for reset triggers
 * - Firing signals and coordinating with other services on reset events
 *
 * The ResetService acts as the central authority for all reset-related mechanics,
 * ensuring a consistent and fair reset experience for players, and providing hooks
 * for other systems to respond to resets.
 *
 * @since 1.0.0
 */
import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { getPlayer } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import { BadgeService, Players, RunService } from "@rbxts/services";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import ItemService from "server/services/item/ItemService";
import ChatHookService from "server/services/permissions/ChatHookService";
import { log } from "server/services/permissions/LogService";
import RevenueService from "server/services/RevenueService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Operative from "shared/item/traits/Operative";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";
import { RESET_LAYERS } from "shared/ResetLayer";
import Sandbox from "shared/Sandbox";

const RESET_UPGRADES = NamedUpgrades.getUpgrades("Reset");

/**
 * Service for managing all reset and prestige layer logic.
 * Handles item, currency, and upgrade resets, reward calculation, and reset triggers.
 */
@Service()
export default class ResetService implements OnInit, OnStart {
    /**
     * Signal fired when a player completes a reset.
     * @param player The player who reset
     * @param layer The reset layer id
     * @param amount The amount of reward given
     */
    reset = new Signal<(player: Player, layer: ResetLayerId, amount: OnoeNum) => void>();
    /**
     * Tracks whether a reset is currently in progress per layer.
     */
    resettingPerLayer = new Map<ResetLayerId, boolean>();

    /**
     * Constructs the ResetService with all required dependencies.
     */
    constructor(
        private chatHookService: ChatHookService,
        private dataService: DataService,
        private itemService: ItemService,
        private currencyService: CurrencyService,
        private namedUpgradeService: NamedUpgradeService,
        private revenueService: RevenueService,
    ) {}

    /**
     * Determines if an item should be kept, unplaced, or reset for a given layer.
     * @param itemId Item id to check
     * @param resetLayer Reset layer to reset on
     * @param placedIn Where the item is placed
     * @returns 0 if kept, 1 if unplaced, 2 if reset
     */
    shouldRemove(itemId: string, resetLayer: ResetLayer, placedIn?: AreaId) {
        const item = Items.getItem(itemId);
        if (item === undefined) return 0;
        const shouldReset = item.getResetLayer() <= resetLayer.order;
        if (shouldReset === true) return 2;
        else return placedIn === resetLayer.area.id ? 1 : 0;
    }

    /**
     * Removes from inventory any items that should be reset for the given layer.
     * @param inventory The inventory to filter
     * @param resetLayer The reset layer
     * @returns The filtered inventory
     */
    filterExcludeInventory(inventory: Inventory, resetLayer: ResetLayer) {
        for (const [itemId] of inventory) {
            if (this.shouldRemove(itemId, resetLayer) === 2) {
                inventory.delete(itemId);
            }
        }
        return inventory;
    }

    /**
     * Unplaces world items that should be unplaced or reset for the given layer.
     * @param resetLayer The reset layer
     * @param items The items data
     * @returns The updated inventory
     */
    unplaceItems(resetLayer: ResetLayer, items: ItemsData) {
        const inventory = items.inventory;
        for (const [placementId, placedItem] of items.worldPlaced) {
            const status = this.shouldRemove(placedItem.item, resetLayer, placedItem.area as AreaId | undefined);
            if (status === 0) continue;

            items.worldPlaced.delete(placementId);
            if (status === 1) {
                inventory.set(placedItem.item, (inventory.get(placedItem.item) ?? 0) + 1);
            }
        }
        return inventory;
    }

    /**
     * Removes and unplaces all items as required for the given reset layer.
     * Updates inventory and placed items, and performs dupe checks.
     * @param resetLayer The reset layer
     */
    removeItems(resetLayer: ResetLayer) {
        const items = this.dataService.empireData.items;
        // Remove placed items
        const inventory = this.unplaceItems(resetLayer, items);
        items.bought = this.filterExcludeInventory(items.bought, resetLayer);
        items.inventory = this.filterExcludeInventory(inventory, resetLayer);
        this.dataService.dupeCheck(items);
        this.itemService.requestChanges();
    }

    /**
     * Sets up a touch interaction for triggering a reset, with countdown and permission checks.
     * @param touchPart The part to detect touches on
     * @param required The required currency bundle to reset
     * @param action Callback for when players are touching and countdown updates
     */
    hookTouch(
        touchPart: BasePart,
        required: CurrencyBundle,
        action: (touching: Set<Player>, countdown: number) => void,
    ) {
        const players = new Set<Player>();
        let t = 0;
        let countdownStarted = false;
        const update = () => {
            if (countdownStarted === false) {
                t = tick();
            }
            countdownStarted = !players.isEmpty();
        };
        touchPart.CanTouch = true;
        touchPart.Touched.Connect((otherPart) => {
            const player = getPlayer(otherPart);
            if (player === undefined || !this.dataService.checkPermLevel(player, "reset")) return;
            const [affordable] = this.currencyService.canAfford(required);
            if (affordable === true) {
                players.add(player);
                update();
            }
        });
        touchPart.TouchEnded.Connect((otherPart) => {
            const player = getPlayer(otherPart);
            if (player === undefined || !this.dataService.checkPermLevel(player, "reset")) return;
            const changed = players.delete(player);
            if (changed === true) {
                update();
                action(players, 3);
            }
        });
        RunService.Heartbeat.Connect(() => {
            const countdown = t + 3 - tick();
            if (countdownStarted) {
                action(players, countdown);
                if (countdown <= 0) {
                    t = 0;
                    countdownStarted = false;
                }
            }
        });
    }

    /**
     * Performs the full reset process for the given layer: removes items, resets currencies and upgrades, updates empire data.
     * @param resetLayer The reset layer
     */
    performReset(resetLayer: ResetLayer) {
        this.removeItems(resetLayer);
        this.itemService.fullUpdatePlacedItemsModels();
        for (const resettingCurrency of resetLayer.resettingCurrencies)
            this.currencyService.set(resettingCurrency, new OnoeNum(0));
        for (const resettingUpgrade of resetLayer.resettingUpgrades)
            this.namedUpgradeService.setUpgradeAmount(resettingUpgrade, 0);

        const empireData = this.dataService.empireData;
        empireData.lastReset = tick();
        empireData.mostCurrenciesSinceReset.clear();
    }

    /**
     * Calculates the reward for resetting at the specified layer.
     * Applies all relevant upgrades and softcaps.
     * @param resetLayer Reset layer to get the reward for
     * @param balance Balance to use for the reward calculation. Defaults to the current balance
     * @returns Reward for resetting at the specified layer
     */
    getResetReward(resetLayer: ResetLayer, balance = this.currencyService.balance) {
        const amount = balance.get(resetLayer.scalesWith);
        let value = new CurrencyBundle();
        if (amount === undefined) {
            return value;
        }
        if (resetLayer.minimum.moreThan(amount)) return value;

        value = value.set(resetLayer.gives, resetLayer.formula.apply(amount));

        let [totalAdd, totalMul, totalPow] = Operative.template();
        [totalAdd, totalMul, totalPow] = this.revenueService.applyGlobal(totalAdd, totalMul, totalPow, RESET_UPGRADES);
        const worth = Operative.coalesce(value, totalAdd, totalMul, totalPow);
        this.revenueService.performSoftcaps(worth.amountPerCurrency);
        return worth;
    }

    /**
     * Initializes the ResetService, sets up UI, signals, and touch handlers for all reset layers.
     * Integrates with currency changes and triggers reset logic as needed.
     */
    onInit() {
        if (Sandbox.getEnabled()) return;

        const balanceChanged = (balance: CurrencyBundle) => {
            for (const [name, resetLayer] of pairs(RESET_LAYERS)) {
                const reward = this.getResetReward(resetLayer, balance);
                const isNoBaseAmount = reward.amountPerCurrency.isEmpty();
                this.resettingPerLayer.set(name, !isNoBaseAmount);
                resetLayer.gainLabel.Text = isNoBaseAmount ? `0 ${resetLayer.gives}` : reward.toString();
                const msgLabel = resetLayer.touchPart.BillboardGui.TextLabel;
                if (isNoBaseAmount === true) {
                    msgLabel.Text = `You need ${CurrencyBundle.getFormatted(resetLayer.scalesWith, resetLayer.minimum)} to reset`;
                    msgLabel.LayoutOrder = 2;
                } else if (msgLabel.LayoutOrder === 2) {
                    msgLabel.Text = "Stand on the altar for 3 seconds to reset";
                    msgLabel.LayoutOrder = 1;
                }
            }
        };
        this.currencyService.balanceChanged.connect(balanceChanged);
        balanceChanged(this.currencyService.balance);

        this.reset.connect((player, layer, amount) => {
            const resetLayer = RESET_LAYERS[layer];
            const color = CURRENCY_DETAILS[resetLayer.gives].color;
            this.chatHookService.sendServerMessage(
                `${player.Name} performed a ${layer} for ${CurrencyBundle.getFormatted(resetLayer.gives, amount)}`,
                `color:${color.R * 255},${color.G * 255},${color.B * 255}`,
            );
            log({
                time: tick(),
                type: "Reset",
                layer: layer,
                player: player.UserId,
                infAmount: amount,
                currency: resetLayer.gives,
            });
        });
    }

    onStart() {
        for (const [name, resetLayer] of pairs(RESET_LAYERS)) {
            resetLayer.touchPart.BillboardGui.TextLabel.LayoutOrder = 2;
            this.hookTouch(
                resetLayer.touchPart,
                new CurrencyBundle().set(resetLayer.scalesWith, resetLayer.minimum),
                (players, countdown) => {
                    resetLayer.touchPart.BillboardGui.TextLabel.Text = `Stand on the altar for ${math.floor(countdown * 100) / 100} seconds to reset`;
                    if (countdown <= 0) {
                        const reward = this.getResetReward(resetLayer);
                        if (reward === undefined) return;
                        const [currency, amount] = reward.getFirst();
                        if (amount === undefined) return;
                        Packets.reset.toAllClients(name, amount);
                        let p: Player | undefined;
                        const spawnCframe = resetLayer.tpLocation?.CFrame;
                        for (const player of players) {
                            p = player;
                            if (player.Character !== undefined && spawnCframe !== undefined) {
                                player.Character.PivotTo(spawnCframe);
                            }
                        }
                        if (p === undefined) {
                            return;
                        }
                        this.resettingPerLayer.set(name, false);
                        this.reset.fire(p, name, amount);
                        task.delay(2, () => {
                            if (p === undefined) return;
                            this.performReset(resetLayer);
                            this.currencyService.increment(currency!, amount);
                            for (const player of Players.GetPlayers()) {
                                pcall(() => BadgeService.AwardBadge(player.UserId, resetLayer.badgeId));
                            }
                        });
                    }
                },
            );
        }
    }
}
