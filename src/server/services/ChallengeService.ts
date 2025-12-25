//!native
//!optimize 2

/**
 * @fileoverview Manages challenge gameplay, UI, and progression.
 *
 * This service handles:
 * - Starting and ending challenges
 * - Challenge requirements, rewards, and effects
 * - Challenge UI updates and synchronization
 * - Challenge state persistence and backup
 *
 * @since 1.0.0
 */

import { simpleInterval } from "@antivivi/vrldk";
import { OnStart, Service } from "@flamework/core";
import { OnoeNum } from "@rbxts/serikanum";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import SetupService from "server/services/data/SetupService";
import ChatHookService from "server/services/permissions/ChatHookService";
import PermissionService from "server/services/permissions/PermissionService";
import ResetService from "server/services/ResetService";
import { CHALLENGE_PER_ID, CHALLENGE_UPGRADES, REWARD_UPGRADES } from "shared/Challenge";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Packets from "shared/Packets";

/**
 * Service that manages challenge logic, UI, and progression.
 */
@Service()
export class ChallengeService implements OnStart {
    /** Debounce timer for challenge actions. */
    private debounce = 0;

    /** Last completion timestamp for challenge effect throttling. */
    private lastCompletion = 0;
    private readonly lastEffectPerChallenge = new Map<string, number>();

    constructor(
        private readonly dataService: DataService,
        private readonly resetService: ResetService,
        private readonly currencyService: CurrencyService,
        private readonly namedUpgradeService: NamedUpgradeService,
        private readonly setupService: SetupService,
        private readonly permissionsService: PermissionService,
        private readonly chatHookService: ChatHookService,
    ) {}

    /**
     * Starts a challenge for the player, performing resets and backups as needed.
     *
     * @param player The player starting the challenge.
     * @param challengeId The ID of the challenge to start.
     * @returns The challenge details if started, otherwise undefined.
     */
    startChallenge(player: Player, challengeId: string) {
        const t = tick();
        if (t - this.debounce < 1) {
            return;
        }
        this.debounce = t;

        print("starting challenge", challengeId);
        const challengeDetails = CHALLENGE_PER_ID.get(challengeId);
        if (challengeDetails === undefined) return;

        const empireData = this.dataService.empireData;
        const currentLevel = this.getChallengeLevel(challengeId);
        if (currentLevel > challengeDetails.cap) return;

        const requiredEmpireLevel = challengeDetails.requiredEmpireLevel(currentLevel + 1);
        if (empireData.level < requiredEmpireLevel) return;

        if (challengeDetails.resets !== undefined) {
            const resetLayer = RESET_LAYERS[challengeDetails.resets as ResetLayerId];
            if (resetLayer !== undefined) {
                // save the setup first
                this.setupService.saveSetup(player, resetLayer.area, "Autosaved");

                empireData.backup.upgrades = new Map();
                for (const [upgrade, amount] of empireData.upgrades)
                    if (resetLayer.resettingUpgrades.includes(upgrade)) empireData.backup.upgrades.set(upgrade, amount);

                empireData.backup.currencies = new Map();
                for (const [currency, amount] of this.currencyService.balance.amountPerCurrency)
                    if (resetLayer.resettingCurrencies.includes(currency))
                        empireData.backup.currencies.set(currency, amount);

                this.resetService.performReset(resetLayer);
            }
        }
        empireData.currentChallengeStartTime = empireData.playtime;
        empireData.currentChallenge = challengeId;
        this.refreshCurrentChallenge();

        return challengeDetails;
    }
    /**
     * Updates the current challenge UI and synchronizes state with the client.
     */
    refreshCurrentChallenge() {
        const challengeId = this.dataService.empireData.currentChallenge;
        if (challengeId === undefined) {
            Packets.currentChallenge.set("");
            for (const [_, id] of CHALLENGE_UPGRADES) this.namedUpgradeService.setUpgradeAmount(id, 0);
        } else {
            const currentLevel = this.getChallengeLevel(challengeId);
            Packets.currentChallenge.set(challengeId);
            for (const [id, upgId] of CHALLENGE_UPGRADES)
                this.namedUpgradeService.setUpgradeAmount(upgId, id === challengeId ? currentLevel : 0);
        }
    }

    /**
     * Ends the current challenge, restoring backups and updating stats.
     *
     * @param cleared Whether the challenge was cleared.
     * @returns Tuple of challenge and new clears count.
     */
    endChallenge(cleared: boolean) {
        const t = tick();
        if (t - this.debounce < 1) {
            return $tuple(undefined, undefined);
        }
        this.debounce = t;

        const data = this.dataService.empireData;
        const challengeId = data.currentChallenge;
        if (challengeId === undefined) {
            return $tuple(undefined, undefined);
        }
        const challenge = CHALLENGE_PER_ID.get(challengeId);
        if (challenge === undefined) return $tuple(undefined, undefined);

        const resetLayer = RESET_LAYERS[challenge.resets as ResetLayerId];
        const cachedCurrencies = table.clone(data.currencies);

        this.resetService.performReset(resetLayer);
        data.currentChallenge = undefined;

        if (data.backup.currencies !== undefined) {
            for (const [currency, amount] of data.backup.currencies) {
                const currentAmount = cachedCurrencies.get(currency);
                if (currentAmount === undefined || new OnoeNum(currentAmount).lessThan(amount))
                    this.currencyService.set(currency, new OnoeNum(amount));
            }
            data.backup.currencies = undefined;
        }

        if (data.backup.upgrades !== undefined) {
            data.backup.upgrades.forEach((amount, id) => {
                if (this.namedUpgradeService.getUpgradeAmount(id) < amount) {
                    this.namedUpgradeService.setUpgradeAmount(id, amount);
                }
            });
            data.backup.upgrades = undefined;
        }
        let newClears: number | undefined;
        if (cleared === true) {
            const clears = data.challenges.get(challengeId);
            newClears = clears === undefined ? 1 : clears + 1;
            data.challenges.set(challengeId, newClears);

            const bestClear = data.challengeBestTimes.get(challengeId);
            const dt = data.playtime - data.currentChallengeStartTime;
            if (bestClear === undefined || dt > bestClear) {
                data.challengeBestTimes.set(challengeId, dt);
            }

            // Grant item rewards for this challenge level
            const itemReward = challenge.itemRewards?.get(newClears);
            if (itemReward !== undefined) {
                const itemId = itemReward.item.id;
                const currentRewards = data.challengeItemRewards.get(itemId) ?? 0;
                data.challengeItemRewards.set(itemId, currentRewards + itemReward.count);
                Packets.challengeItemBonuses.set(data.challengeItemRewards);
            }
        }
        this.refreshChallenges();
        return $tuple(challenge, newClears);
    }

    /**
     * Returns the current level for a given challenge ID.
     * @param challengeId The challenge ID.
     */
    getChallengeLevel(challengeId: string) {
        const clears = this.dataService.empireData.challenges.get(challengeId);
        return clears === undefined ? 1 : clears + 1;
    }

    /**
     * Applies the effect of the current challenge, checking for completion and running challenge logic.
     */
    challengeEffect() {
        const data = this.dataService.empireData;
        const challengeId = data.currentChallenge;
        if (challengeId === undefined) return;
        const challenge = CHALLENGE_PER_ID.get(challengeId);
        if (challenge === undefined) return;

        let challengeCompleted = false;
        if (typeIs(challenge.goal, "table")) {
            const items = challenge.goal as Item[];
            for (const item of items) {
                const amount = data.items.inventory.get(item.id);
                if (amount === undefined || amount < 1) continue;
                challengeCompleted = true;
                break;
            }
        }

        const t = tick();
        if (
            challengeCompleted === true &&
            t - this.lastCompletion > 2 &&
            data.playtime - data.currentChallengeStartTime > 2
        ) {
            this.lastCompletion = t;
            const title = challenge.getTitleLabel(this.getChallengeLevel(challengeId));
            this.chatHookService.sendServerMessage(`Challenge ${title} has been cleared!`);
            const [_challenge, clears] = this.endChallenge(true);
            Packets.challengeCompleted.toAllClients(title, challenge.getRewardLabel(clears!));
        } else if (challenge.challengeEffect !== undefined) {
            if (!this.lastEffectPerChallenge.has(challengeId)) {
                this.lastEffectPerChallenge.set(challengeId, t);
            }
            const dt = t - this.lastEffectPerChallenge.get(challengeId)!;
            if (challenge.challengeEffectInterval === undefined || dt > challenge.challengeEffectInterval) {
                this.lastEffectPerChallenge.set(challengeId, t);
                challenge.challengeEffect(dt, this.getChallengeLevel(challengeId), (message) => {
                    this.endChallenge(false);
                    this.chatHookService.sendServerMessage(message);
                });
            }
        }
    }

    /**
     * Refreshes the list of available challenges and updates the UI.
     */
    refreshChallenges() {
        const currentLevelPerChallenge = new Map<string, number>();
        for (const [id, challenge] of CHALLENGE_PER_ID) {
            const currentLevel = this.getChallengeLevel(id);
            if (currentLevel > challenge.cap) continue;
            if (currentLevel > 1) {
                const upgradeId = REWARD_UPGRADES.get(id);
                if (upgradeId !== undefined) this.namedUpgradeService.setUpgradeAmount(upgradeId, currentLevel - 1);
            }
            currentLevelPerChallenge.set(id, currentLevel);
        }
        Packets.currentLevelPerChallenge.set(currentLevelPerChallenge);
        this.refreshCurrentChallenge();
        this.initializeChallengeRewards();
    }

    /**
     * Initializes challenge item rewards tracker based on completed challenges.
     * This ensures players who completed challenges before this feature receive their rewards retroactively.
     */
    private initializeChallengeRewards() {
        const data = this.dataService.empireData;
        const rewardMap = new Map<string, number>();

        // Calculate all item rewards based on completed challenge levels
        for (const [challengeId, clears] of data.challenges) {
            const challenge = CHALLENGE_PER_ID.get(challengeId);
            if (challenge === undefined || challenge.itemRewards === undefined) continue;

            // Sum up rewards for all completed levels
            for (let level = 1; level <= clears; level++) {
                const itemReward = challenge.itemRewards.get(level);
                if (itemReward !== undefined) {
                    const itemId = itemReward.item.id;
                    rewardMap.set(itemId, (rewardMap.get(itemId) ?? 0) + itemReward.count);
                }
            }
        }

        // Update the data if there are any discrepancies
        let hasChanges = false;
        for (const [itemId, expectedAmount] of rewardMap) {
            const currentAmount = data.challengeItemRewards.get(itemId) ?? 0;
            if (currentAmount !== expectedAmount) {
                data.challengeItemRewards.set(itemId, expectedAmount);
                hasChanges = true;
            }
        }

        if (hasChanges) {
            Packets.challengeItemBonuses.set(data.challengeItemRewards);
        }
    }

    /**
     * Starts the challenge service, sets up listeners, and begins challenge effect loop.
     */
    onStart() {
        Packets.startChallenge.fromClient((player, challengeId) => {
            if (!this.permissionsService.hasPermission(player, "reset")) return false;
            if (this.dataService.empireData.questMetadata.get("ChallengesUnlocked") !== true) return false;

            const challenge = this.startChallenge(player, challengeId);
            if (challenge === undefined) return false;

            this.chatHookService.sendServerMessage(
                `Challenge ${challenge.getTitleLabel(this.getChallengeLevel(challenge.id))} has been started by ${player.Name}. The original setup has been saved, called "Autosaved", in a printer.`,
            );
            return true;
        });

        const quitConnection = Packets.quitChallenge.fromClient((player) => {
            if (!this.permissionsService.hasPermission(player, "reset")) return;

            const [challenge] = this.endChallenge(false);
            if (challenge === undefined) return;

            this.chatHookService.sendServerMessage(
                `Challenge ${challenge.getTitleLabel(this.getChallengeLevel(challenge.id))} has been stopped by ${player.Name}.`,
            );
        });

        this.refreshChallenges();

        const cleanup = simpleInterval(() => {
            this.challengeEffect();
        }, 0.5);

        eat(quitConnection, "Disconnect");
        eat(cleanup);
    }
}
