import { toNumeral } from "@rbxts/roman-numerals";
import { OnoeNum } from "@rbxts/serikanum";
import { Debris, TweenService, Workspace } from "@rbxts/services";
import StringBuilder from "@rbxts/stringbuilder";
import { Server } from "shared/api/APIExpose";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import AdvancedRefiner from "shared/items/negative/a/AdvancedRefiner";
import Admiration from "shared/items/negative/instantwin/Admiration";
import Codependence from "shared/items/negative/instantwin/Codependence";
import { GainUpgrade } from "shared/namedupgrade/NamedUpgrade";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

declare global {
    interface Assets {
        VFX: Folder;
    }
}

export class Challenge {
    static readonly CHALLENGES = new Array<Challenge>();

    /** The name of the challenge. */
    name: string;

    /**
     * Gets the description for the challenge at a given level.
     * @param level The challenge description at the given level.
     * @returns The description.
     */
    description = (level: number) => "No description provided.";

    /**
     * The colors used for the challenge UI.
     */
    colors = { primary: new Color3(), secondary: new Color3() };

    /** The maximum level for the challenge. */
    cap = 1;

    /**
     * Minimum empire level required to start the challenge at a given level.
     * @param level The challenge level to start.
     * @return The required empire level.
     */
    requiredEmpireLevel = (level: number) => 0;

    challengeEffectInterval = -1;
    challengeEffect?: (dt: number, level: number, forceEnd: (message: string) => void) => void;
    challengeUpgrade?: GainUpgrade;
    rewardUpgrade?: GainUpgrade;
    itemRewards?: Map<number, { item: Item; count: number }>;
    resets?: ResetLayerId;
    goal: Item[] | string = "No goal provided.";
    itemRestrictionFilter?: (item: Item) => boolean;

    constructor(public readonly id: string) {
        this.name = this.id;
        Challenge.CHALLENGES.push(this);
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    setDescription(description: (level: number) => string) {
        this.description = description;
        return this;
    }

    setColors(primary: Color3, secondary: Color3) {
        this.colors = { primary, secondary };
        return this;
    }

    setCap(cap: number) {
        this.cap = cap;
        return this;
    }

    setRequiredEmpireLevel(empireLevel: (level: number) => number) {
        this.requiredEmpireLevel = empireLevel;
        return this;
    }

    setChallengeEffectInterval(interval: number) {
        this.challengeEffectInterval = interval;
        return this;
    }

    setChallengeEffect(effect: (dt: number, level: number, forceEnd: (message: string) => void) => void) {
        this.challengeEffect = effect;
        return this;
    }

    setChallengeUpgrade(upgrade: GainUpgrade) {
        const upgradeId = this.id + "_ch";
        NamedUpgrades.register(upgradeId, upgrade);
        this.challengeUpgrade = upgrade;
        return this;
    }

    setRewardUpgrade(upgrade: GainUpgrade) {
        const upgradeId = this.id + "_rw";
        NamedUpgrades.register(upgradeId, upgrade);
        this.rewardUpgrade = upgrade;
        return this;
    }

    setItemRewards(rewards: Map<number, { item: Item; count: number }>) {
        this.itemRewards = rewards;
        return this;
    }

    setResets(layerId: ResetLayerId) {
        this.resets = layerId;
        return this;
    }

    setGoal(goal: Item[] | string) {
        this.goal = goal;
        return this;
    }

    setItemRestrictionFilter(filter: (item: Item) => boolean) {
        this.itemRestrictionFilter = filter;
        return this;
    }

    /**
     * Returns the formatted title label for a challenge.
     * @param level The challenge level.
     */
    getTitleLabel(level: number) {
        return `${this.name} ${toNumeral(level)}`;
    }

    /**
     * Returns the task label for a challenge.
     * @param challenge The challenge details.
     */
    getTaskLabel() {
        if (typeIs(this.goal, "table")) {
            const builder = new StringBuilder("Get ");
            this.goal.forEach((item, i) => builder.append(i === 0 ? item.name : "/" + item.name));
            return builder.toString();
        }
        return "No task";
    }

    /**
     * Returns the reward label for a challenge at the given level.
     * @param currentLevel The current challenge level.
     */
    getRewardLabel(currentLevel: number) {
        const itemReward = this.itemRewards?.get(currentLevel + 1);
        if (itemReward !== undefined) {
            return `${itemReward.count}x ${itemReward.item.name}`;
        }
        const upgrade = this.rewardUpgrade;
        if (upgrade !== undefined) {
            return upgrade.toString(currentLevel) + " -> " + upgrade.toString(currentLevel + 1);
        }
        return "No reward";
    }

    static readonly MeltingEconomy = (() => {
        const getNerf = (level: number) => {
            if (level > 9) {
                return 0.01;
            } else {
                return 1 - level * 0.1;
            }
        };

        const itemRewards = new Map<number, { item: Item; count: number }>();
        itemRewards.set(1, { item: AdvancedRefiner, count: 1 });
        itemRewards.set(2, { item: AdvancedRefiner, count: 2 });
        itemRewards.set(3, { item: AdvancedRefiner, count: 3 });
        itemRewards.set(4, { item: AdvancedRefiner, count: 4 });
        itemRewards.set(5, { item: AdvancedRefiner, count: 5 });

        return new Challenge("MeltingEconomy")
            .setName("Melting Economy")
            .setDescription((level) => `Funds gain is heavily nerfed by ^${getNerf(level)}.`)
            .setColors(Color3.fromRGB(170, 255, 151), Color3.fromRGB(0, 170, 255))
            .setCap(5)
            .setRequiredEmpireLevel((level) => level + 5)
            .setChallengeUpgrade(new GainUpgrade().setPow((x) => new CurrencyBundle().set("Funds", getNerf(x))))
            .setItemRewards(itemRewards)
            .setResets("Skillification" as ResetLayerId)
            .setGoal([Admiration, Codependence]);
    })();

    static readonly CataclysmicWorld = (() => {
        const cwMeteorTween = new TweenInfo(0.5, Enum.EasingStyle.Linear);
        const cataclysicWorldCd = (level: number) => 22 - level * 7;
        const spawnMeteor = () => {
            const meteor = ASSETS.VFX.WaitForChild("Meteor").Clone() as BasePart;
            const grid = AREAS.BarrenIslands.gridWorldNode!.waitForInstance();
            const rand = grid.Size.X * 0.25;
            const target = grid.Position.add(
                new Vector3((math.random() - 0.5) * rand, 0, (math.random() - 0.5) * rand),
            );
            meteor.CFrame = CFrame.lookAt(
                target.add(new Vector3(math.random(-50, 50), 300, math.random(-50, 50))),
                target,
            );
            TweenService.Create(meteor, cwMeteorTween, { Position: target }).Play();
            meteor.Parent = Workspace;
            task.delay(0.5, () => {
                meteor.Transparency = 1;
                meteor.ClearAllChildren();
                playSound("Explosion.mp3", meteor);
                meteor.CanCollide = false;
                meteor.CanTouch = false;
                meteor.CanQuery = false;
                const reverb = () => {
                    const part = new Instance("Part");
                    part.Anchored = true;
                    part.CanCollide = false;
                    part.Shape = Enum.PartType.Ball;
                    part.Position = meteor.Position;
                    part.Color = new Color3(1, 0.48, 0);
                    part.Transparency = 0.6;
                    part.CanCollide = false;
                    part.CanTouch = false;
                    part.CanQuery = false;
                    TweenService.Create(part, new TweenInfo(0.2), {
                        Size: new Vector3(100, 100, 100),
                        Transparency: 1,
                    }).Play();
                    part.Parent = meteor;
                };
                reverb();
                task.delay(0.1, reverb);
                task.delay(0.2, reverb);
                const explosion = new Instance("Explosion");
                explosion.ExplosionType = Enum.ExplosionType.NoCraters;
                explosion.BlastRadius = 150;
                explosion.BlastPressure = 500000;
                explosion.DestroyJointRadiusPercent = 0;
                explosion.Position = meteor.Position;
                explosion.Parent = meteor;
                Packets.shakeCamera.toAllClients("Bump");
            });
            Debris.AddItem(meteor, 5);
        };

        return new Challenge("CataclysmicWorld")
            .setName("Cataclysmic World")
            .setDescription(
                (level) =>
                    `Meteors strike your setup every ${cataclysicWorldCd(level)} seconds. Every 4 minutes, the cooldown halves.`,
            )
            .setColors(Color3.fromRGB(234, 7, 255), Color3.fromRGB(255, 85, 127))
            .setCap(3)
            .setRequiredEmpireLevel((level) => level + 6)
            .setChallengeEffect((dt: number, level: number, forceEnd: (message: string) => void) => {
                const challengeStart = Server.empireData.currentChallengeStartTime;
                const questMetadata = Server.empireData.questMetadata;
                let meteorCooldown = questMetadata.get("CataclysmicWorldCooldown") as number | undefined;
                if (meteorCooldown === undefined || meteorCooldown <= 0) {
                    const elapsed = math.floor((Server.empireData.playtime - challengeStart) / 240);
                    meteorCooldown = cataclysicWorldCd(level) / math.pow(2, elapsed);
                    if (meteorCooldown < 0.5) {
                        forceEnd(
                            "Cataclysmic World was forcefully stopped because it was impossible to continue. You could not save the world.",
                        );
                        return;
                    }
                    spawnMeteor();
                } else {
                    meteorCooldown -= dt;
                }
                questMetadata.set("CataclysmicWorldCooldown", meteorCooldown);
            })
            .setChallengeEffectInterval(1)
            .setResets("Skillification" as ResetLayerId)
            .setRewardUpgrade(
                new GainUpgrade().setMul((x) => new CurrencyBundle().set("Skill", new OnoeNum(1.5).pow(x))),
            )
            .setGoal([Admiration, Codependence]);
    })();

    static readonly PinnedProgress = (() => {
        return new Challenge("PinnedProgress")
            .setName("Pinned Progress")
            .setDescription(() => `You cannot place Conveyors down.`)
            .setColors(Color3.fromRGB(29, 67, 80), Color3.fromRGB(164, 57, 49))
            .setCap(3)
            .setRequiredEmpireLevel((level) => level * 2 + 6)
            .setItemRestrictionFilter((item: Item) => {
                return !item.isA("Conveyor");
            })
            .setRewardUpgrade(new GainUpgrade().setMul((x) => new CurrencyBundle().set("Power", new OnoeNum(2).pow(x))))
            .setResets("Skillification" as ResetLayerId)
            .setGoal([Admiration, Codependence]);
    })();
}

export const [CHALLENGE_PER_ID, CHALLENGE_UPGRADES, REWARD_UPGRADES] = (function () {
    const challengePerId = new Map<string, Challenge>();
    const challengeUpgrades = new Map<string, string>();
    const rewardUpgrades = new Map<string, string>();
    for (const challenge of Challenge.CHALLENGES) {
        challengePerId.set(challenge.id, challenge);
        if (challenge.challengeUpgrade !== undefined) {
            challengeUpgrades.set(challenge.id, challenge.challengeUpgrade.id);
        }
        if (challenge.rewardUpgrade !== undefined) {
            rewardUpgrades.set(challenge.id, challenge.rewardUpgrade.id);
        }
    }
    return [challengePerId, challengeUpgrades, rewardUpgrades];
})();
