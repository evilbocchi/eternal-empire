//!native
//!optimize 2

import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import { toNumeral } from "@rbxts/roman-numerals";
import StringBuilder from "@rbxts/stringbuilder";
import { CHALLENGE_UPGRADES, CHALLENGES, REWARD_UPGRADES } from "server/Challenges";
import { PermissionsService } from "server/services/PermissionsService";
import { ResetService } from "server/services/ResetService";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import { SetupService } from "server/services/serverdata/SetupService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import { getChallengeGui } from "shared/constants";
import { ASSETS } from "shared/GameAssets";
import Item from "shared/item/Item";
import Packets from "shared/Packets";
import { RESET_LAYERS } from "shared/ResetLayer";
import Sandbox from "shared/Sandbox";

declare global {
    interface Assets {
        ChallengeOption: Frame & {
            Description: Frame & {
                DescriptionLabel: TextLabel,
                NoticeLabel: TextLabel,
                RequirementLabel: TextLabel;
            },
            StartButton: TextButton & {
                Label: TextLabel;
            },
            RewardLabel: TextLabel,
            TitleLabel: TextLabel & {
                UIGradient: UIGradient;
            };
        };
    }
}


@Service()
export class ChallengeService implements OnInit {

    debounce = 0;
    lastCompletion = 0;
    forceEnd = (message: string) => {
        this.endChallenge(false);
        this.permissionsService.sendServerMessage(message);
    };

    constructor(private dataService: DataService, private resetService: ResetService, private itemsService: ItemsService,
        private currencyService: CurrencyService, private upgradeBoardService: UpgradeBoardService,
        private setupService: SetupService, private permissionsService: PermissionsService) {

    }

    startChallenge(player: Player, challengeId: ChallengeId) {
        const t = tick();
        if (t - this.debounce < 1) {
            return;
        }
        this.debounce = t;

        print("starting challenge", challengeId);
        const challengeDetails = CHALLENGES[challengeId];
        if (challengeDetails === undefined)
            return;

        const empireData = this.dataService.empireData;
        const currentLevel = this.getChallengeLevel(challengeId);
        if (currentLevel > challengeDetails.cap)
            return;

        if (challengeDetails.resets !== undefined) {
            const resetLayer = RESET_LAYERS[challengeDetails.resets as ResetLayerId];
            if (resetLayer !== undefined) {
                // save the setup first
                this.setupService.saveSetup(player, resetLayer.area.id, "Autosaved");

                empireData.backup.upgrades = new Map();
                for (const [upgrade, amount] of empireData.upgrades)
                    if (resetLayer.resettingUpgrades.includes(upgrade))
                        empireData.backup.upgrades.set(upgrade, amount);

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

    getNotice(challenge: ChallengeDetails) {
        switch (challenge.resets) {
            case "Skillification":
                return "A Skillification will be simulated. You will lose your items.";
            default:
                return "";
        }
    }

    getTitleLabel(challenge: ChallengeDetails, id?: string, level?: number) {
        if (level === undefined) {
            if (id === undefined)
                throw "Specify an id for non-provided levels";
            level = this.getChallengeLevel(id);
        }
        return `${challenge.name} ${(toNumeral(level))}`;
    }

    getRequirementLabel(challenge: ChallengeDetails) {
        if (typeOf(challenge.goal) === "table") {
            const builder = new StringBuilder("Get ");
            (challenge.goal as Item[]).forEach((item, i) => builder.append(i === 0 ? item.name : "/" + item.name));
            return builder.toString();
        }
        return "No requirement";
    }

    getRewardLabel(challenge: ChallengeDetails, currentLevel: number) {
        const upgrade = challenge.rewardUpgrade;
        if (upgrade !== undefined) {
            return upgrade.toString(currentLevel - 1) + " -> " + upgrade.toString(currentLevel);
        }
        return "No reward";
    }

    refreshCurrentChallenge() {
        const challengeId = this.dataService.empireData.currentChallenge as ChallengeId | undefined;
        const gui = getChallengeGui();
        if (gui === undefined) {
            throw "No challenge gui found";
        }
        const challengeOptions = gui.ChallengeOptions;
        const currentChallengeWindow = gui.CurrentChallenge;
        if (challengeId === undefined) {
            currentChallengeWindow.Visible = false;
            challengeOptions.Visible = true;
            Packets.currentChallenge.set({
                name: "",
                r1: 0,
                g1: 0,
                b1: 0,
                r2: 0,
                g2: 0,
                b2: 0,
                description: ""
            });
            for (const [_, id] of CHALLENGE_UPGRADES)
                this.upgradeBoardService.setUpgradeAmount(id, 0);
        }
        else {
            currentChallengeWindow.Visible = true;
            challengeOptions.Visible = false;
            const challenge = CHALLENGES[challengeId];
            const requirement = "Requirement: " + this.getRequirementLabel(challenge);
            currentChallengeWindow.RequirementLabel.Text = requirement;
            const currentLevel = this.getChallengeLevel(challengeId);
            const title = this.getTitleLabel(challenge, challengeId, currentLevel);
            currentChallengeWindow.TitleLabel.Text = title;
            currentChallengeWindow.TitleLabel.UIGradient.Color = challenge.color;

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
                description: challenge.description(currentLevel) + "\n" + requirement
            });
            for (const [id, upgId] of CHALLENGE_UPGRADES)
                this.upgradeBoardService.setUpgradeAmount(upgId, id === challengeId ? currentLevel : 0);
        }
    }

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
        if (challenge === undefined)
            return $tuple(undefined, undefined);

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
                if (this.upgradeBoardService.getUpgradeAmount(id) < amount) {
                    this.upgradeBoardService.setUpgradeAmount(id, amount);
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

    getChallengeLevel(challengeId: string) {
        const clears = this.dataService.empireData.challenges.get(challengeId);
        return clears === undefined ? 1 : clears + 1;
    }

    challengeEffect() {
        const data = this.dataService.empireData;
        const challengeId = data.currentChallenge;
        if (challengeId === undefined)
            return;
        const challenge = CHALLENGES[challengeId as ChallengeId];
        if (challenge === undefined)
            return;

        let challengeCompleted = false;
        if (typeOf(challenge.goal) === "table") {
            const items = challenge.goal as Item[];
            for (const item of items) {
                const amount = data.items.inventory.get(item.id);
                if (amount === undefined || amount < 1)
                    continue;
                challengeCompleted = true;
                break;
            }
        }

        const t = tick();
        if (challengeCompleted === true && t - this.lastCompletion > 2 && data.playtime - data.currentChallengeStartTime > 2) {
            this.lastCompletion = t;
            const title = this.getTitleLabel(challenge, challengeId);
            this.permissionsService.sendServerMessage(`Challenge ${title} has been cleared!`);
            const [_challenge, _id, clears] = this.endChallenge(true);
            Packets.challengeCompleted.fireAll(title, this.getRewardLabel(challenge, clears!));
        }
        else if (challenge.challengeEffect !== undefined) {
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

    refreshChallenges() {
        let i = 0;
        const gui = getChallengeGui();
        if (gui === undefined) {
            throw "No challenge gui found";
        }
        const challengeOptions = gui.ChallengeOptions;
        challengeOptions.GetChildren().forEach((instance) => {
            if (instance.IsA("Frame"))
                instance.Destroy();
        });
        for (const [key, challenge] of pairs(CHALLENGES)) {
            const currentLevel = this.getChallengeLevel(key);
            if (currentLevel > challenge.cap)
                continue;
            const challengeOption = ASSETS.ChallengeOption.Clone();
            challengeOption.TitleLabel.Text = this.getTitleLabel(challenge, key, currentLevel);
            challengeOption.TitleLabel.UIGradient.Color = challenge.color;
            challengeOption.Description.DescriptionLabel.Text = challenge.description(currentLevel);
            challengeOption.Description.NoticeLabel.Text = this.getNotice(challenge);
            challengeOption.Description.RequirementLabel.Text = "Requirement: " + this.getRequirementLabel(challenge);
            challengeOption.RewardLabel.Text = "Boost: " + this.getRewardLabel(challenge, currentLevel);
            challengeOption.LayoutOrder = challenge.order ?? -i;
            challengeOption.Name = key;
            challengeOption.Parent = challengeOptions;
            if (currentLevel > 1) {
                const upgradeId = REWARD_UPGRADES.get(key);
                if (upgradeId !== undefined)
                    this.upgradeBoardService.setUpgradeAmount(upgradeId, currentLevel - 1);
            }
            ++i;
        }
        this.refreshCurrentChallenge();
    }

    onInit() {
        if (Sandbox.getEnabled())
            return;

        Packets.startChallenge.listen((player, challengeId) => {
            if (!this.dataService.checkPermLevel(player, "reset"))
                return;
            const challenge = this.startChallenge(player, challengeId as ChallengeId);
            if (challenge === undefined)
                return;
            this.permissionsService.sendServerMessage(`Challenge ${this.getTitleLabel(challenge, challengeId)} has been started by ${player.Name}. The original setup has been saved, called "Autosaved", in a printer.`);

        });
        Packets.quitChallenge.listen((player) => {
            if (!this.dataService.checkPermLevel(player, "reset"))
                return;
            const [challenge, challengeId] = this.endChallenge(false);
            if (challenge === undefined)
                return;
            this.permissionsService.sendServerMessage(`Challenge ${this.getTitleLabel(challenge, challengeId)} has been stopped by ${player.Name}.`);
        });
        this.refreshChallenges();

        task.spawn(() => {
            while (task.wait(0.5)) {
                this.challengeEffect();
            }
        });
    }
}