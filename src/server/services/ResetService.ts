import { OnStart, Service } from "@flamework/core";
import { BadgeService, Players, RunService } from "@rbxts/services";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import Area from "shared/Area";
import Price from "shared/Price";
import { AREAS, Inventory, PlacedItem, RESET_LAYERS } from "shared/constants";
import NamedUpgrade from "shared/item/NamedUpgrade";
import Items from "shared/items/Items";
import { Fletchette, RemoteSignal, Signal } from "@antivivi/fletchette";
import { OnoeNum } from "@antivivi/serikanum";
import { GameAssetService } from "./GameAssetService";
import { CurrencyService } from "./serverdata/CurrencyService";
import { DataService } from "./serverdata/DataService";
import { ItemsService } from "./serverdata/ItemsService";

declare global {
    interface FletchetteCanisters {
        ResetCanister: typeof ResetCanister;
    }
}

const trillion = OnoeNum.fromSerika(1, 12);
const ResetCanister = Fletchette.createCanister("ResetCanister", {
    reset: new RemoteSignal<(layer: number, amount: OnoeNum) => void>(),
});

@Service()
export class ResetService implements OnStart {

    reset = new Signal<(player: Player, layer: number, amount: OnoeNum) => void>();

    constructor(private dataService: DataService, private itemsService: ItemsService, private currencyService: CurrencyService, 
        private gameAssetService: GameAssetService, private upgradeBoardService: UpgradeBoardService) {

    }

    shouldRemove(itemId: string, resetLayerIndex: number) {
        const item = Items.getItem(itemId);
        if (item === undefined)
            return false;
        const index = item.getResetLayer();
        if (index === -1)
            return false;
        else
            return index <= resetLayerIndex;
    }

    filterExcludeInventory(inventory: Inventory, resetLayerIndex: number) {
        for (const [itemId] of inventory) {
            if (this.shouldRemove(itemId, resetLayerIndex)) {
                inventory.delete(itemId);
            }
        }
        return inventory;
    }

    removeItems(resetLayerIndex: number) {
        // Remove placed items
        const placedItems = this.itemsService.getPlacedItems();
        const newPlacedItems = new Array<PlacedItem>();
        for (const placedItem of placedItems) {
            if (!this.shouldRemove(placedItem.item, resetLayerIndex)) {
                newPlacedItems.push(placedItem);
            }
        }
        this.itemsService.setPlacedItems(newPlacedItems);

        // Remove bought history
        this.itemsService.setBought(this.filterExcludeInventory(this.itemsService.getBought(), resetLayerIndex));

        // Remove items from inventory
        this.itemsService.setInventory(this.filterExcludeInventory(this.itemsService.getInventory(), resetLayerIndex));
    }

    getUpgraded(value: Price) {
        const upgrades = this.upgradeBoardService.getAmountPerUpgrade();
        for (const [upgradeId, amount] of pairs(upgrades)) {
            const upgrade = NamedUpgrade.getUpgrade(upgradeId as string);
            if (upgrade === undefined)
                continue;
            const formula = upgrade.resetFormula;
            if (formula !== undefined) {
                value = formula(value, amount, upgrade.step);
            }
        }
        return value;
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
        }
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

    onStart() {
        this.currencyService.balanceChanged.connect((balance) => {
            for (const resetLayer of RESET_LAYERS) {
                const baseAmount = balance.get(resetLayer.scalesWith);
                const isNoBaseAmount = baseAmount === undefined || baseAmount.lessThan(trillion);
                resetLayer.isResetting = !isNoBaseAmount;
                resetLayer.gainLabel.Text = `${isNoBaseAmount ? 0 : resetLayer.formula.apply(baseAmount)} Skill`;
                const msgLabel = resetLayer.touchPart.BillboardGui.TextLabel;
                if (isNoBaseAmount) {
                    msgLabel.Text = `You need ${Price.getFormatted(resetLayer.scalesWith, resetLayer.minimum)} to reset`;
                    msgLabel.LayoutOrder = 2;
                }
                else if (msgLabel.LayoutOrder === 2) {
                    msgLabel.Text = "Stand on the altar for 3 seconds to reset";
                    msgLabel.LayoutOrder = 1;
                }
            }
        });

        for (let i = 0; i < RESET_LAYERS.size(); i++) {
            const resetLayer = RESET_LAYERS[i];
            this.hookTouch(resetLayer.touchPart, new Price().setCost(resetLayer.scalesWith, resetLayer.minimum), (players, countdown) => {
                resetLayer.touchPart.BillboardGui.TextLabel.Text = `Stand on the altar for ${math.floor(countdown * 100) / 100} seconds to reset`;
                if (countdown <= 0) {
                    const currency = resetLayer.gives;
                    const amount = resetLayer.formula.apply(this.currencyService.getCost(resetLayer.scalesWith));
                    ResetCanister.reset.fireAll(i, amount);
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
                    resetLayer.isResetting = false;
                    this.reset.fire(p, i, amount);
                    task.delay(2, () => {
                        if (p === undefined)
                            return;
                        this.removeItems(i);
                        this.gameAssetService.fullUpdatePlacedItemsModels();
                        for (const resettingCurrency of resetLayer.resettingCurrencies)
                            this.currencyService.setCost(resettingCurrency, new OnoeNum(0));
                        for (const resettingUpgrade of resetLayer.resettingUpgrades)
                            this.upgradeBoardService.setUpgradeAmount(resettingUpgrade, 0);
                        this.currencyService.incrementCost(currency, amount);
                        for (const player of Players.GetPlayers()) {
                            pcall(() => BadgeService.AwardBadge(player.UserId, resetLayer.badgeId));
                        }
                    });
                }
            });
        }
        
    }
}