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

import { OnoeNum } from "@antivivi/serikanum";
import { simpleInterval } from "@antivivi/vrldk";
import { OnStart, Service } from "@flamework/core";
import { toNumeral } from "@rbxts/roman-numerals";
import StringBuilder from "@rbxts/stringbuilder";
import { CHALLENGE_UPGRADES, CHALLENGES, REWARD_UPGRADES } from "server/Challenges";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import SetupService from "server/services/data/SetupService";
import ItemService from "server/services/item/ItemService";
import ChatHookService from "server/services/permissions/ChatHookService";
import PermissionsService from "server/services/permissions/PermissionsService";
import ResetService from "server/services/ResetService";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

/**
 * Service that manages challenge logic, UI, and progression.
 */
@Service()
export class ChallengeService implements OnStart {
    /** Debounce timer for challenge actions. */
    debounce = 0;

    /** Last completion timestamp for challenge effect throttling. */
    lastCompletion = 0;

    /**
     * Forces the end of a challenge and sends a server message.
     *
     * @param message The message to send to the server.
     */
    forceEnd = (message: string) => {
        this.endChallenge(false);
        this.chatHookService.sendServerMessage(message);
    };

    constructor(
        private dataService: DataService,
        private resetService: ResetService,
        private itemService: ItemService,
        private currencyService: CurrencyService,
        private namedUpgradeService: NamedUpgradeService,
        private setupService: SetupService,
        private permissionsService: PermissionsService,
        private chatHookService: ChatHookService,
    ) {}

    /**
     * Starts a challenge for the player, performing resets and backups as needed.
     *
     * @param player The player starting the challenge.
     * @param challengeId The ID of the challenge to start.
     * @returns The challenge details if started, otherwise undefined.
     */
    startChallenge(player: Player, challengeId: ChallengeId) {
        const t = tick();
        if (t - this.debounce < 1) {
            return;
        }
        this.debounce = t;

        print("starting challenge", challengeId);
        const challengeDetails = CHALLENGES[challengeId];
        if (challengeDetails === undefined) return;

        const empireData = this.dataService.empireData;
        const currentLevel = this.getChallengeLevel(challengeId);
        if (currentLevel > challengeDetails.cap) return;

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
     * Returns a notice string for the given challenge.
     *
     * @param challenge The challenge details.
     */
    getNotice(challenge: ChallengeDetails) {
        switch (challenge.resets) {
            case "Skillification":
                return "A Skillification will be simulated. You will lose your items.";
            case "Winification":
                return "A Winification will be simulated. You will lose your items.";
            default:
                return "";
        }
    }

    /**
     * Returns the formatted title label for a challenge.
     *
     * @param challenge The challenge details.
     * @param id The challenge ID.
     * @param level The challenge level (optional).
     */
    getTitleLabel(challenge: ChallengeDetails, id?: string, level?: number) {
        if (level === undefined) {
            if (id === undefined) throw "Specify an id for non-provided levels";
            level = this.getChallengeLevel(id);
        }
        return `${challenge.name} ${toNumeral(level)}`;
    }

    /**
     * Returns the requirement label for a challenge.
     * @param challenge The challenge details.
     */
    getRequirementLabel(challenge: ChallengeDetails) {
        if (typeIs(challenge.goal, "table")) {
            const builder = new StringBuilder("Get ");
            (challenge.goal as Item[]).forEach((item, i) => builder.append(i === 0 ? item.name : "/" + item.name));
            return builder.toString();
        }
        return "No requirement";
    }

    /**
     * Returns the reward label for a challenge at the given level.
     *
     * @param challenge The challenge details.
     * @param currentLevel The current challenge level.
     */
    getRewardLabel(challenge: ChallengeDetails, currentLevel: number) {
        const upgrade = challenge.rewardUpgrade;
        if (upgrade !== undefined) {
            return upgrade.toString(currentLevel - 1) + " -> " + upgrade.toString(currentLevel);
        }
        return "No reward";
    }

    /**
     * Updates the current challenge UI and synchronizes state with the client.
     */
    refreshCurrentChallenge() {
        const challengeId = this.dataService.empireData.currentChallenge as ChallengeId | undefined;
        if (challengeId === undefined) {
            Packets.currentChallenge.set({
                name: "",
                r1: 0,
                g1: 0,
                b1: 0,
                r2: 0,
                g2: 0,
                b2: 0,
                description: "",
            });
            for (const [_, id] of CHALLENGE_UPGRADES) this.namedUpgradeService.setUpgradeAmount(id, 0);
        } else {
            const challenge = CHALLENGES[challengeId];
            const requirement = "Requirement: " + this.getRequirementLabel(challenge);
            const currentLevel = this.getChallengeLevel(challengeId);
            const title = this.getTitleLabel(challenge, challengeId, currentLevel);

            const colors = challenge.color.Keypoints;
            const c1 = colors[0].Value;
            const c2 = colors[1].Value;
            Packets.currentChallenge.set({
                name: title,
                r1: c1.R,
                g1: c1.G,
                b1: c1.B,
                r2: c2.R,
                g2: c2.G,
                b2: c2.B,
                description: challenge.description(currentLevel) + "\n" + requirement,
            });
            for (const [id, upgId] of CHALLENGE_UPGRADES)
                this.namedUpgradeService.setUpgradeAmount(upgId, id === challengeId ? currentLevel : 0);
        }
    }

    /**
     * Ends the current challenge, restoring backups and updating stats.
     *
     * @param cleared Whether the challenge was cleared.
     * @returns Tuple of challenge, challengeId, and new clears count.
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
        const challenge = CHALLENGES[challengeId as ChallengeId];
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
        }
        this.refreshChallenges();
        return $tuple(challenge, challengeId, newClears);
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
        const challenge = CHALLENGES[challengeId as ChallengeId];
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
            const title = this.getTitleLabel(challenge, challengeId);
            this.chatHookService.sendServerMessage(`Challenge ${title} has been cleared!`);
            const [_challenge, _id, clears] = this.endChallenge(true);
            Packets.challengeCompleted.toAllClients(title, this.getRewardLabel(challenge, clears!));
        } else if (challenge.challengeEffect !== undefined) {
            if (challenge.lastEffect === undefined) {
                challenge.lastEffect = t;
            }
            const dt = t - challenge.lastEffect;
            if (challenge.challengeEffectInterval === undefined || dt > challenge.challengeEffectInterval) {
                challenge.lastEffect = t;
                challenge.challengeEffect(dt, this.getChallengeLevel(challengeId), this.forceEnd);
            }
        }
    }

    /**
     * Refreshes the list of available challenges and updates the UI.
     */
    refreshChallenges() {
        let i = 0;
        for (const [key, challenge] of pairs(CHALLENGES)) {
            const currentLevel = this.getChallengeLevel(key);
            if (currentLevel > challenge.cap) continue;
            if (currentLevel > 1) {
                const upgradeId = REWARD_UPGRADES.get(key);
                if (upgradeId !== undefined) this.namedUpgradeService.setUpgradeAmount(upgradeId, currentLevel - 1);
            }
            ++i;
        }
        this.refreshCurrentChallenge();
    }

    /**
     * Starts the challenge service, sets up listeners, and begins challenge effect loop.
     */
    onStart() {
        if (Sandbox.getEnabled()) return;

        Packets.startChallenge.fromClient((player, challengeId) => {
            if (!this.permissionsService.checkPermLevel(player, "reset")) return;
            const challenge = this.startChallenge(player, challengeId as ChallengeId);
            if (challenge === undefined) return;
            this.chatHookService.sendServerMessage(
                `Challenge ${this.getTitleLabel(challenge, challengeId)} has been started by ${player.Name}. The original setup has been saved, called "Autosaved", in a printer.`,
            );
        });
        Packets.quitChallenge.fromClient((player) => {
            if (!this.permissionsService.checkPermLevel(player, "reset")) return;
            const [challenge, challengeId] = this.endChallenge(false);
            if (challenge === undefined) return;
            this.chatHookService.sendServerMessage(
                `Challenge ${this.getTitleLabel(challenge, challengeId)} has been stopped by ${player.Name}.`,
            );
        });
        this.refreshChallenges();

        const cleanup = simpleInterval(() => {
            this.challengeEffect();
        }, 0.5);
        eat(cleanup);
    }
}
