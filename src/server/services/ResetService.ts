import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import { BadgeService, Players, RunService } from "@rbxts/services";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import Price from "shared/Price";
import { RESET_LAYERS } from "shared/constants";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/network/Packets";
import { CurrencyService } from "./serverdata/CurrencyService";
import { DataService } from "./serverdata/DataService";
import { ItemsService } from "./serverdata/ItemsService";
import { RevenueService } from "server/services/RevenueService";

declare global {
    type ResetLayerId = keyof (typeof RESET_LAYERS);
    type ResetLayer = (typeof RESET_LAYERS)[ResetLayerId];
}

const trillion = OnoeNum.fromSerika(1, 12);
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
        const newPlacedItems = new Array<PlacedItem>();
        const inventory = items.inventory;
        items.placed.forEach((placedItem) => {
            const status = this.shouldRemove(placedItem.item, resetLayer, placedItem.area as AreaId | undefined);
            if (status === 1) {
                inventory.set(placedItem.item, (inventory.get(placedItem.item) ?? 0) + 1);
            }
            else if (status === 0) {
                newPlacedItems.push(placedItem);
            }
        });
        items.placed = newPlacedItems;
        return inventory;
    }

    removeItems(resetLayer: ResetLayer) {
        const items = this.dataService.empireData.items;
        // Remove placed items
        const inventory = this.unplaceItems(resetLayer, items);
        items.bought = this.filterExcludeInventory(items.bought, resetLayer);
        items.inventory = this.filterExcludeInventory(inventory, resetLayer);

        this.itemsService.setItems(items);
    }

    getPlayer(otherPart: BasePart) {
        if (otherPart.Name !== "HumanoidRootPart")
            return;
        const character = otherPart.Parent;
        if (character === undefined)
            return;
        const player = Players.GetPlayerFromCharacter(character);
        if (player === undefined || !this.dataService.checkPermLevel(player, "reset")) {
            return;
        }
        return player;
    }

    hookTouch(touchPart: BasePart, price: Price, action: (touching: Set<Player>, countdown: number) => void) {
        const players = new Set<Player>();
        let t = 0;
        let countdownStarted = false;
        const update = () => {
            if (countdownStarted === false) {
                t = tick();
            }
            countdownStarted = !players.isEmpty();
        };
        touchPart.Touched.Connect((otherPart) => {
            const player = this.getPlayer(otherPart);
            if (player === undefined)
                return;
            const [affordable] = this.currencyService.isSufficientBalance(price);
            if (affordable === true) {
                players.add(player);
                update();
            }
        });
        touchPart.TouchEnded.Connect((otherPart) => {
            const player = this.getPlayer(otherPart);
            if (player === undefined)
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
            this.currencyService.setCost(resettingCurrency, new OnoeNum(0));
        for (const resettingUpgrade of resetLayer.resettingUpgrades)
            this.upgradeBoardService.setUpgradeAmount(resettingUpgrade, 0);
    }

    getResetReward(resetLayer: ResetLayer) {
        const amount = this.currencyService.getCost(resetLayer.scalesWith);
        let value = new Price();
        let totalAdd = Price.EMPTY_PRICE;
        let totalMul = Price.ONES;
        let totalPow = Price.ONES;
        if (resetLayer.minimum.moreThan(amount))
            return value;
        value = value.setCost(resetLayer.gives, resetLayer.formula.apply(amount));
        [totalAdd, totalMul, totalPow] = this.revenueService.applyGlobal(totalAdd, totalMul, totalPow, RESET_UPGRADES);
        const worth = this.revenueService.coalesce(value, totalAdd, totalMul, totalPow);
        this.revenueService.applySoftcaps(worth.costPerCurrency);
        return worth;
    }

    onInit() {
        this.currencyService.balanceChanged.connect((balance) => {
            for (const [name, resetLayer] of pairs(RESET_LAYERS)) {
                const baseAmount = balance.get(resetLayer.scalesWith);
                const isNoBaseAmount = baseAmount === undefined || baseAmount.lessThan(trillion);
                this.resettingPerLayer.set(name, !isNoBaseAmount);
                resetLayer.gainLabel.Text = `${isNoBaseAmount ? 0 : resetLayer.formula.apply(baseAmount)} Skill`;
                const msgLabel = resetLayer.touchPart.BillboardGui.TextLabel;
                if (isNoBaseAmount === true) {
                    msgLabel.Text = `You need ${Price.getFormatted(resetLayer.scalesWith, resetLayer.minimum)} to reset`;
                    msgLabel.LayoutOrder = 2;
                }
                else if (msgLabel.LayoutOrder === 2) {
                    msgLabel.Text = "Stand on the altar for 3 seconds to reset";
                    msgLabel.LayoutOrder = 1;
                }
            }
        });


        for (const [name, resetLayer] of pairs(RESET_LAYERS)) {
            resetLayer.touchPart.BillboardGui.TextLabel.LayoutOrder = 2;
            this.hookTouch(resetLayer.touchPart, new Price().setCost(resetLayer.scalesWith, resetLayer.minimum), (players, countdown) => {
                resetLayer.touchPart.BillboardGui.TextLabel.Text = `Stand on the altar for ${math.floor(countdown * 100) / 100} seconds to reset`;
                if (countdown <= 0) {
                    const price = this.getResetReward(resetLayer);
                    if (price === undefined)
                        return;
                    const [currency, amount] = price.getFirst();
                    if (amount === undefined)
                        return;
                    Packets.reset.fireAll(name, amount);
                    let p: Player | undefined;
                    for (const player of players) {
                        p = player;
                        if (player.Character !== undefined) {
                            player.Character.PivotTo(resetLayer.tpLocation.CFrame);
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
                        this.currencyService.incrementCost(currency!, amount);
                        for (const player of Players.GetPlayers()) {
                            pcall(() => BadgeService.AwardBadge(player.UserId, resetLayer.badgeId));
                        }
                    });
                }
            });
        }

    }
}