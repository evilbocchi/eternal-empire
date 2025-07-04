import { OnoeNum } from "@antivivi/serikanum";
import { TweenService, Workspace, Debris } from "@rbxts/services";
import { getSound } from "shared/GameAssets";
import { ASSETS } from "shared/GameAssets";
import { AREAS } from "shared/Area";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Admiration from "shared/items/negative/instantwin/Admiration";
import Codependence from "shared/items/negative/instantwin/Codependence";
import { GainUpgrade } from "shared/namedupgrade/NamedUpgrade";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { ServerAPI } from "shared/item/ItemUtils";
import { playSoundAtPart } from "@antivivi/vrldk";

declare global {
    type ChallengeId = keyof (typeof CHALLENGES);
    type ChallengeDetails = typeof CHALLENGES[ChallengeId];

    interface Assets {
        VFX: Folder;
    }
}

namespace Challenges {
    const meltingEconomyNerf = (level: number) => {
        if (level > 9) {
            return 0.01;
        }
        else {
            return 1 - (level * 0.1);
        }
    };
    export const MeltingEconomy = {
        name: "Melting Economy",
        description: (level: number) => `Funds gain is heavily nerfed by ^${meltingEconomyNerf(level)}.`,
        color: new ColorSequence(Color3.fromRGB(170, 255, 151), Color3.fromRGB(0, 170, 255)),
        cap: 5,
        challengeUpgrade: new GainUpgrade().setPow(x => new CurrencyBundle().set("Funds", meltingEconomyNerf(x))),
        rewardUpgrade: new GainUpgrade().setMul(x => new CurrencyBundle().set("Funds", new OnoeNum(1.75).pow(x))),
        resets: "Skillification",
        goal: [Admiration, Codependence],
        order: 1,
    };

    const cwMeteorTween = new TweenInfo(0.5, Enum.EasingStyle.Linear);
    const cataclysicWorldCd = (level: number) => 22 - (level * 7);
    const spawnMeteor = () => {
        const meteor = ASSETS.VFX.WaitForChild("Meteor").Clone() as BasePart;
        const grid = AREAS.BarrenIslands.getGrid()!;
        let rand = grid.Size.X * 0.25;
        let target = grid.Position.add(new Vector3((math.random() - 0.5) * rand, 0, (math.random() - 0.5) * rand));
        meteor.CFrame = CFrame.lookAt(target.add(new Vector3(math.random(-50, 50), 300, math.random(-50, 50))), target);
        TweenService.Create(meteor, cwMeteorTween, { Position: target }).Play();
        meteor.Parent = Workspace;
        task.delay(0.5, () => {
            meteor.Transparency = 1;
            meteor.ClearAllChildren();
            playSoundAtPart(meteor, getSound("Explosion"));
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
                TweenService.Create(part, new TweenInfo(0.2), { Size: new Vector3(100, 100, 100), Transparency: 1 }).Play();
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
            Packets.camShake.fireAll();
        });
        Debris.AddItem(meteor, 5);
    };
    export const CataclysmicWorld = {
        name: "Cataclysmic World",
        description: (level: number) => `Meteors strike your setup every ${cataclysicWorldCd(level)} seconds. Every 4 minutes, the cooldown halves.`,
        color: new ColorSequence(Color3.fromRGB(234, 7, 255), Color3.fromRGB(255, 85, 127)),
        cap: 3,
        challengeEffectInterval: 1,
        challengeEffect: (dt: number, level: number, forceEnd: (message: string) => void) => {
            const empireData = ServerAPI.empireData;
            const challengeStart = empireData.currentChallengeStartTime;
            const questMetadata = empireData.questMetadata;
            let meteorCooldown = questMetadata.get("CataclysmicWorldCooldown") as number | undefined;
            if (meteorCooldown === undefined || meteorCooldown <= 0) {
                const elapsed = math.floor((empireData.playtime - challengeStart) / 240);
                meteorCooldown = cataclysicWorldCd(level) / math.pow(2, elapsed);
                if (meteorCooldown < 0.5) {
                    forceEnd("Cataclysmic World was forcefully stopped because it was impossible to continue. You could not save the world.");
                    return;
                }
                spawnMeteor();
            }
            else {
                meteorCooldown -= dt;
            }
            questMetadata.set("CataclysmicWorldCooldown", meteorCooldown);

        },
        resets: "Skillification",
        rewardUpgrade: new GainUpgrade().setMul(x => new CurrencyBundle().set("Skill", new OnoeNum(1.5).pow(x))),
        goal: [Admiration, Codependence],
        order: 2,
    };

    const pinnedProgressNerf = (level: number) => 1 - (level * 0.08);
    export const PinnedProgress = {
        name: "Pinned Progress",
        description: (level: number) => `You cannot place Conveyors down, and an additional ^${pinnedProgressNerf(level)} Funds and Power nerf is applied.`,
        color: new ColorSequence(Color3.fromRGB(29, 67, 80), Color3.fromRGB(164, 57, 49)),
        cap: 3,
        challengeUpgrade: new GainUpgrade().setPow(x => {
            const res = pinnedProgressNerf(x);
            return new CurrencyBundle().set("Funds", res).set("Power", res);
        }),
        restrictItems: (item: Item) => {
            const types = item.types;
            let count = 0;
            for (const [name, builder] of types) {
                if (name === "Conveyor" || name === "Operative") {
                    ++count;
                }
                else if (name === "Upgrader") {
                    const upgrader = builder as Upgrader;
                    if (upgrader.add !== undefined || upgrader.mul !== undefined || upgrader.pow !== undefined)
                        return false;
                }
                else {
                    return false;
                }
            }
            return count === 2;
        },
        rewardUpgrade: new GainUpgrade().setMul(x => new CurrencyBundle().set("Power", new OnoeNum(2).pow(x))),
        resets: "Skillification",
        goal: [Admiration, Codependence],
        order: 3,
    };
}

export const [CHALLENGES, CHALLENGE_UPGRADES, REWARD_UPGRADES] = (function () {
    type ChallengeId = keyof (typeof Challenges);
    type ChallengeDetails = Combine<typeof Challenges[ChallengeId]> & { lastEffect: number | undefined; };
    const challenges = Challenges as Record<ChallengeId, ChallengeDetails>;
    const challengeUpgrades = new Map<string, string>();
    const rewardUpgrades = new Map<string, string>();
    for (const [id, challenge] of pairs(challenges)) {
        if (challenge.challengeUpgrade !== undefined) {
            const upgradeId = id + "_ch";
            NamedUpgrades.register(upgradeId, challenge.challengeUpgrade);
            challengeUpgrades.set(id, upgradeId);
        }
        if (challenge.rewardUpgrade !== undefined) {
            const upgradeId = id + "_rw";
            NamedUpgrades.register(upgradeId, challenge.rewardUpgrade);
            rewardUpgrades.set(id, upgradeId);
        }
    }
    return [challenges, challengeUpgrades, rewardUpgrades];
})();