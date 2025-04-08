import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import { BadgeService, Players, RunService } from "@rbxts/services";
import { RevenueService } from "server/services/RevenueService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Operative from "shared/item/traits/Operative";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";
import { RESET_LAYERS } from "shared/ResetLayer";
import Sandbox from "shared/Sandbox";
import { getPlayer } from "@antivivi/vrldk";
import { CurrencyService } from "./serverdata/CurrencyService";
import { DataService } from "./serverdata/DataService";
import { ItemsService } from "./serverdata/ItemsService";

const RESET_UPGRADES = NamedUpgrades.getUpgrades("Reset");

@Service()
export class ResetService implements OnInit {

    reset = new Signal<(player: Player, layer: ResetLayerId, amount: OnoeNum) => void>();
    resettingPerLayer = new Map<ResetLayerId, boolean>();

    constructor(private dataService: DataService, private itemsService: ItemsService,
        private currencyService: CurrencyService, private upgradeBoardService: UpgradeBoardService,
        private revenueService: RevenueService) {

    }

    /**
     * Whether the specified item should be kept, unplaced or reset from the server.
     * 
     * @param itemId Item id to check
     * @param resetLayer Reset layer to reset on
     * @param placedIn Where the item is placed
     * @returns 0 if the item should be kept, 1 if the item should be unplaced and 2 if the item should be reset
     */
    shouldRemove(itemId: string, resetLayer: ResetLayer, placedIn?: AreaId) {
        const item = Items.getItem(itemId);
        if (item === undefined)
            return 0;
        const shouldReset = item.getResetLayer() <= resetLayer.order;
        if (shouldReset === true)
            return 2;
        else
            return placedIn === resetLayer.area.id ? 1 : 0;
    }

    filterExcludeInventory(inventory: Inventory, resetLayer: ResetLayer) {
        for (const [itemId] of inventory) {
            if (this.shouldRemove(itemId, resetLayer) === 2) {
                inventory.delete(itemId);
            }
        }
        return inventory;
    }

    unplaceItems(resetLayer: ResetLayer, items: ItemsData) {
        const inventory = items.inventory;
        for (const [placementId, placedItem] of items.worldPlaced) {
            const status = this.shouldRemove(placedItem.item, resetLayer, placedItem.area as AreaId | undefined);
            if (status === 0)
                continue;

            items.worldPlaced.delete(placementId);
            if (status === 1) {
                inventory.set(placedItem.item, (inventory.get(placedItem.item) ?? 0) + 1);
            }
        }
        return inventory;
    }

    removeItems(resetLayer: ResetLayer) {
        const items = this.dataService.empireData.items;
        // Remove placed items
        const inventory = this.unplaceItems(resetLayer, items);
        items.bought = this.filterExcludeInventory(items.bought, resetLayer);
        items.inventory = this.filterExcludeInventory(inventory, resetLayer);

        this.dataService.dupeCheck(items);
        this.itemsService.setItems(items);
    }

    hookTouch(touchPart: BasePart, required: CurrencyBundle, action: (touching: Set<Player>, countdown: number) => void) {
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
            if (player === undefined || !this.dataService.checkPermLevel(player, "reset"))
                return;
            const [affordable] = this.currencyService.canAfford(required);
            if (affordable === true) {
                players.add(player);
                update();
            }
        });
        touchPart.TouchEnded.Connect((otherPart) => {
            const player = getPlayer(otherPart);
            if (player === undefined || !this.dataService.checkPermLevel(player, "reset"))
                return;
            const changed = players.delete(player);
            if (changed === true) {
                update();
                action(players, 3);
            }
        });
        RunService.Heartbeat.Connect(() => {
            const countdown = (t + 3) - tick();
            if (countdownStarted) {
                action(players, countdown);
                if (countdown <= 0) {
                    t = 0;
                    countdownStarted = false;
                }
            }
        });
    }

    performReset(resetLayer: ResetLayer) {
        this.removeItems(resetLayer);
        this.itemsService.fullUpdatePlacedItemsModels();
        for (const resettingCurrency of resetLayer.resettingCurrencies)
            this.currencyService.set(resettingCurrency, new OnoeNum(0));
        for (const resettingUpgrade of resetLayer.resettingUpgrades)
            this.upgradeBoardService.setUpgradeAmount(resettingUpgrade, 0);

        const empireData = this.dataService.empireData;
        empireData.lastReset = tick();
        empireData.mostCurrenciesSinceReset.clear();
    }

    /**
     * Get the reward for resetting at the specified layer.
     * 
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
        if (resetLayer.minimum.moreThan(amount))
            return value;

        value = value.set(resetLayer.gives, resetLayer.formula.apply(amount));

        let [totalAdd, totalMul, totalPow] = Operative.template();
        [totalAdd, totalMul, totalPow] = this.revenueService.applyGlobal(totalAdd, totalMul, totalPow, RESET_UPGRADES);
        const worth = Operative.coalesce(value, totalAdd, totalMul, totalPow);
        this.revenueService.performSoftcaps(worth.amountPerCurrency);
        return worth;
    }

    onInit() {
        if (Sandbox.getEnabled())
            return;

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
                }
                else if (msgLabel.LayoutOrder === 2) {
                    msgLabel.Text = "Stand on the altar for 3 seconds to reset";
                    msgLabel.LayoutOrder = 1;
                }
            }
        };
        this.currencyService.balanceChanged.connect(balanceChanged);
        balanceChanged(this.currencyService.balance);

        for (const [name, resetLayer] of pairs(RESET_LAYERS)) {
            resetLayer.touchPart.BillboardGui.TextLabel.LayoutOrder = 2;
            this.hookTouch(resetLayer.touchPart, new CurrencyBundle().set(resetLayer.scalesWith, resetLayer.minimum), (players, countdown) => {
                resetLayer.touchPart.BillboardGui.TextLabel.Text = `Stand on the altar for ${math.floor(countdown * 100) / 100} seconds to reset`;
                if (countdown <= 0) {
                    const reward = this.getResetReward(resetLayer);
                    if (reward === undefined)
                        return;
                    const [currency, amount] = reward.getFirst();
                    if (amount === undefined)
                        return;
                    Packets.reset.fireAll(name, amount);
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
                        if (p === undefined)
                            return;
                        this.performReset(resetLayer);
                        this.currencyService.increment(currency!, amount);
                        for (const player of Players.GetPlayers()) {
                            pcall(() => BadgeService.AwardBadge(player.UserId, resetLayer.badgeId));
                        }
                    });
                }
            });
        }

    }
}