import { OnStart, Service } from "@flamework/core";
import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { Players, Workspace } from "@rbxts/services";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import ItemService from "server/services/item/ItemService";
import PermissionsService from "server/services/permissions/PermissionsService";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import { getDifficultyRewardById } from "shared/item/DifficultyRewards";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

type WalkSpeedBuffState = {
    amount: number;
    expiresAt: number;
    connection: RBXScriptConnection;
};

const ITEM_WEIGHTS = new Map<Item, OnoeNum>();

for (const [, item] of Items.itemsPerId) {
    const layoutOrder = math.max(item.layoutOrder, 0);
    let maxAmount = 100;
    const priceSize = item.pricePerIteration.size();
    if (priceSize > 0) {
        maxAmount = math.min(maxAmount, priceSize);
    }

    let weight = new OnoeNum(1);
    // Layout order factor (higher layout order = more valuable)
    weight = weight.add(new OnoeNum(layoutOrder + 10).pow(1.5));
    // Max amount factor (lower max amount = more valuable)
    weight = weight.add(new OnoeNum(200 - maxAmount).pow(1.4));

    ITEM_WEIGHTS.set(item, weight);
}

@Service()
export default class ResearchService implements OnStart {
    private readonly researching: Map<string, number>;
    private readonly difficultyRewardCooldowns: Map<string, number>;
    private readonly difficultyRewardPurchaseCounts: Map<string, number>;
    private readonly walkSpeedBuffs = new Map<number, WalkSpeedBuffState>();

    constructor(
        private readonly currencyService: CurrencyService,
        private readonly dataService: DataService,
        private readonly itemService: ItemService,
        private readonly permissionsService: PermissionsService,
    ) {
        this.researching = dataService.empireData.items.researching;
        this.difficultyRewardCooldowns = dataService.empireData.difficultyRewardCooldowns;
        this.difficultyRewardPurchaseCounts = dataService.empireData.difficultyRewardPurchaseCounts;
    }

    private isItemEligibleForResearch(item: Item) {
        if (item.isA("Unique")) return false;
        if (item.isA("Gear")) return false;
        if (item.difficulty === Difficulty.Bonuses) return false;
        return true;
    }

    /**
     * Reserves items for research if available.
     *
     * @param itemId The ID of the item to reserve.
     * @param amount The amount of the item to reserve.
     * @returns True if reservation succeeded, false otherwise.
     */
    reserveItemsForResearch(itemId: string, amount: number) {
        if (amount < 1) return false;

        const item = Items.getItem(itemId);
        if (item === undefined) return false;
        if (!this.isItemEligibleForResearch(item)) return false;

        const available = this.itemService.getAvailableItemAmount(itemId);
        if (available < amount) return false;

        const current = this.itemService.getResearchingAmount(itemId);
        this.researching.set(itemId, current + amount);
        Packets.researching.set(this.researching);
        this.broadcastResearchMultiplier();
        return true;
    }

    /**
     * Releases items from research back into the available pool.
     *
     * @param itemId The ID of the item to release.
     * @param amount The amount of the item to release.
     * @returns True if release succeeded, false otherwise.
     */
    releaseItemsFromResearch(itemId: string, amount: number) {
        if (amount < 1) return false;

        const current = this.itemService.getResearchingAmount(itemId);
        if (current < amount) return false;

        if (current === amount) {
            this.researching.delete(itemId);
        } else {
            this.researching.set(itemId, current - amount);
        }
        Packets.researching.set(this.researching);
        this.broadcastResearchMultiplier();
        return true;
    }

    private applyWalkSpeedBuff(player: Player, amount: number, durationSeconds: number) {
        if (amount <= 0 || durationSeconds <= 0) {
            return;
        }

        const userId = player?.UserId ?? 0;
        const now = os.clock();
        const expiresAt = now + durationSeconds;

        let state = this.walkSpeedBuffs.get(userId);
        if (state === undefined) {
            const connection = player?.CharacterAdded.Connect((character) => {
                task.spawn(() => {
                    const humanoid =
                        character.FindFirstChildOfClass("Humanoid") ?? (character.WaitForChild("Humanoid") as Humanoid);
                    if (humanoid === undefined) {
                        return;
                    }

                    task.delay(0.05, () => {
                        const latest = this.walkSpeedBuffs.get(userId);
                        if (latest === undefined) {
                            return;
                        }
                        if (humanoid.Parent === undefined) {
                            return;
                        }
                        humanoid.WalkSpeed += latest.amount;
                    });
                });
            });

            state = { amount: 0, expiresAt, connection };
            this.walkSpeedBuffs.set(userId, state);
        }

        state.amount += amount;
        state.expiresAt = math.max(state.expiresAt, expiresAt);

        const humanoid = getPlayerCharacter(player)?.FindFirstChildOfClass("Humanoid");
        if (humanoid) {
            humanoid.WalkSpeed += amount;
        }

        this.scheduleWalkSpeedBuffRemoval(userId);
    }

    private scheduleWalkSpeedBuffRemoval(userId: number) {
        const state = this.walkSpeedBuffs.get(userId);
        if (state === undefined) {
            return;
        }

        const delaySeconds = math.max(state.expiresAt - os.clock(), 0);
        task.delay(delaySeconds, () => this.tryExpireWalkSpeedBuff(userId));
    }

    private tryExpireWalkSpeedBuff(userId: number) {
        const state = this.walkSpeedBuffs.get(userId);
        if (state === undefined) {
            return;
        }

        const now = os.clock();
        if (now < state.expiresAt) {
            this.scheduleWalkSpeedBuffRemoval(userId);
            return;
        }

        const player = Players.GetPlayerByUserId(userId);
        if (player !== undefined) {
            const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
            if (humanoid) {
                const baseWalkSpeed = (Workspace.GetAttribute("WalkSpeed") as number) ?? 16;
                const reduced = humanoid.WalkSpeed - state.amount;
                humanoid.WalkSpeed = math.max(reduced, baseWalkSpeed);
            }
        }

        state.connection.Disconnect();
        this.walkSpeedBuffs.delete(userId);
    }

    /**
     * Processes a difficulty reward claim using the configured reward definitions.
     * Deducts Difficulty Power, grants the configured payout, and applies cooldowns.
     *
     * @param player The player claiming the reward.
     * @param rewardId The identifier of the reward being claimed.
     * @returns Whether the reward claim succeeded.
     */
    claimDifficultyReward(player: Player, rewardId: string) {
        const reward = getDifficultyRewardById(rewardId);
        if (reward === undefined) {
            return false;
        }

        const now = os.time();
        const cooldownExpiresAt = this.difficultyRewardCooldowns.get(reward.id);
        if (cooldownExpiresAt !== undefined && cooldownExpiresAt > now) {
            return false;
        }

        const currentDifficultyPower = this.currencyService.get("Difficulty Power");
        let cost: OnoeNum | undefined;

        if (reward.cost.kind === "percentageOfDifficultyPower") {
            const percentage = math.clamp(reward.cost.percentage, 0, 1);
            cost = currentDifficultyPower.mul(new OnoeNum(percentage));
            if (reward.cost.minimum !== undefined) {
                const minimum = new OnoeNum(reward.cost.minimum);
                if (cost.lessThan(minimum)) {
                    cost = minimum;
                }
            }
        }

        if (cost === undefined || cost.lessThan(0)) {
            return false;
        }
        if (currentDifficultyPower.lessThan(cost)) {
            return false;
        }

        const newDifficultyPower = currentDifficultyPower.sub(cost);
        this.currencyService.set("Difficulty Power", newDifficultyPower);

        switch (reward.effect.kind) {
            case "walkSpeedBuff": {
                this.applyWalkSpeedBuff(player, reward.effect.amount, reward.effect.durationSeconds);
                break;
            }
            case "grantItem": {
                const amount = reward.effect.amount ?? 1;
                if (amount > 0) {
                    this.itemService.giveItem(reward.effect.itemId, amount);
                }
                break;
            }
            case "redeemRevenue": {
                const offlineRevenue = this.currencyService.getOfflineRevenue().mul(reward.effect.seconds);
                const payout = new Map<Currency, OnoeNum>();
                for (const currency of reward.effect.currencies) {
                    const amount = offlineRevenue.get(currency);
                    if (amount === undefined) continue;
                    payout.set(currency, amount);
                }
                if (!payout.isEmpty()) {
                    this.currencyService.incrementAll(payout);
                    Packets.showDifference.toAllClients(payout);
                }
                break;
            }
            case "increaseFurnaceDifficultyPowerGain": {
                this.incrementRewardPurchaseCount(reward.id, 1);
                break;
            }
        }

        this.currencyService.propagate();

        this.difficultyRewardCooldowns.set(reward.id, now + reward.cooldownSeconds);
        Packets.difficultyRewardCooldowns.set(this.difficultyRewardCooldowns);
        return true;
    }

    /**
     * Provides a read-only reference to the researching map.
     */
    getResearchingEntries() {
        return this.researching;
    }

    private incrementRewardPurchaseCount(rewardId: string, amount: number) {
        if (amount !== amount || amount === math.huge || amount === -math.huge) return;
        const sanitized = math.floor(math.max(amount, 0));
        if (sanitized <= 0) return;
        const current = this.difficultyRewardPurchaseCounts.get(rewardId) ?? 0;
        this.difficultyRewardPurchaseCounts.set(rewardId, current + sanitized);
    }

    getRewardPurchaseCount(rewardId: string) {
        const count = this.difficultyRewardPurchaseCounts.get(rewardId) ?? 0;
        return math.max(count, 0);
    }

    getFurnaceDifficultyPowerBonus() {
        let bonus = 0;
        for (const [rewardId, count] of this.difficultyRewardPurchaseCounts) {
            if (count <= 0) continue;
            const definition = getDifficultyRewardById(rewardId);
            if (definition === undefined) continue;
            if (definition.effect.kind !== "increaseFurnaceDifficultyPowerGain") continue;
            bonus += count * definition.effect.amount;
        }
        return bonus;
    }

    /**
     * Calculates the multiplier applied to difficulty power generation based on researching items.
     * Higher difficulty ratings and quantities yield a larger multiplier with diminishing returns.
     */
    calculateResearchMultiplier() {
        let weightedValue = new OnoeNum(0);
        for (const [itemId, amount] of this.researching) {
            if (amount <= 0) continue;

            const item = Items.getItem(itemId);
            if (item === undefined) continue;
            if (!this.isItemEligibleForResearch(item)) continue;

            const perItemWeight = ITEM_WEIGHTS.get(item);
            if (perItemWeight === undefined) continue;
            weightedValue = weightedValue.add(perItemWeight.mul(amount));
        }

        if (weightedValue.lessEquals(0)) return new OnoeNum(1);
        return weightedValue.pow(0.5).div(10);
    }

    /**
     * Broadcasts the current research multiplier to all clients.
     * Called whenever research reservations change.
     */
    private broadcastResearchMultiplier() {
        const multiplier = this.calculateResearchMultiplier();
        Packets.researchMultiplier.set(multiplier);
    }

    onStart() {
        Packets.claimDifficultyReward.fromClient((player, rewardId) => {
            if (!this.permissionsService.checkPermLevel(player, "build")) {
                return false;
            }
            return this.claimDifficultyReward(player, rewardId);
        });

        this.broadcastResearchMultiplier();
        Packets.researching.set(this.researching);
        Packets.difficultyRewardCooldowns.set(this.difficultyRewardCooldowns);
    }
}
