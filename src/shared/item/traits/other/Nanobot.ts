import { TweenService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import type { RepairResultTier } from "shared/item/repair";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Nanobot: Nanobot;
    }
}

interface NanobotOrbState {
    part: BasePart;
    angle: number;
    phase: number;
    traveling: boolean;
    desiredCFrame?: CFrame;
    assignment?: {
        placementId: string;
        target: BasePart;
    };
    activeTween?: Tween;
}

const TAU = math.pi * 2;
const BASE_COLOR = Color3.fromRGB(110, 205, 255);
const ACTIVE_COLOR = Color3.fromRGB(130, 255, 205);
const ORB_SIZE = new Vector3(1.8, 1.8, 1.8);

export default class Nanobot extends ItemTrait {
    readonly orbCount = 3;

    /** Probability (0-1) that a nearby item will be repaired each second. */
    repairChance = 0.35;

    /** Distance limit in studs for targeting broken items. */
    repairRange = 70;

    /** Repair tier applied when the nanobot succeeds. */
    repairTier: RepairResultTier = "Good";

    /** Radius of the orbit for the floating orbs. */
    orbitRadius = 5;

    /** Base height offset above the item origin in studs. */
    orbitHeight = 2.5;

    /** Vertical bobbing amplitude. */
    bobAmplitude = 0.8;

    /** Angular speed of the orbit in radians per second. */
    orbitSpeed = math.rad(40);

    /** Speed multiplier for bobbing motion. */
    bobSpeed = 1.6;

    /** Responsiveness factor for smoothing orbital adjustments. */
    orbitSmoothing = 6;

    private readonly rng = new Random();

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Nanobot.load(model, this));
        item.unbreakable();
    }

    setRepairChance(chance: number) {
        this.repairChance = math.clamp(chance, 0, 1);
        return this;
    }

    setRepairRange(range: number) {
        this.repairRange = math.max(range, 0);
        return this;
    }

    setRepairTier(tier: RepairResultTier) {
        this.repairTier = tier;
        return this;
    }

    setOrbit(radius: number, height: number) {
        this.orbitRadius = math.max(radius, 0);
        this.orbitHeight = height;
        return this;
    }

    private static load(model: Model, nanobot: Nanobot) {
        const anchor = Nanobot.findAnchor(model);
        if (anchor === undefined) return;

        const orbs = Nanobot.createOrbs(model, nanobot);
        Nanobot.animateOrbs(model, anchor, orbs, nanobot);
        Nanobot.startRepairLoop(model, anchor, orbs, nanobot);
    }

    private static findAnchor(model: Model) {
        return model.PrimaryPart ?? (model.FindFirstChildWhichIsA("BasePart") as BasePart | undefined);
    }

    private static createOrbs(model: Model, nanobot: Nanobot) {
        const modelCframe = model.GetPivot();
        const folder = new Instance("Folder");
        folder.Name = "NanobotOrbs";
        folder.Parent = model;

        const orbs = new Array<NanobotOrbState>();
        for (let i = 0; i < nanobot.orbCount; i++) {
            const part = new Instance("Part");
            part.Name = `NanobotOrb${i + 1}`;
            part.Shape = Enum.PartType.Ball;
            part.Size = ORB_SIZE;
            part.Color = BASE_COLOR;
            part.Material = Enum.Material.Neon;
            part.CastShadow = false;
            part.Anchored = true;
            part.CanCollide = false;
            part.CanQuery = false;
            part.CanTouch = false;
            part.CFrame = modelCframe;
            part.Parent = folder;

            orbs.push({
                part,
                angle: (TAU / nanobot.orbCount) * i,
                phase: (TAU / nanobot.orbCount) * i,
                traveling: false,
            });
        }
        return orbs;
    }

    private static animateOrbs(model: Model, anchor: BasePart, orbs: NanobotOrbState[], nanobot: Nanobot) {
        let elapsed = 0;
        const tweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

        nanobot.item.repeat(model, (dt) => {
            elapsed += dt * nanobot.bobSpeed;
            const anchorCf = anchor.CFrame;

            for (const orb of orbs) {
                const assignment = orb.assignment;
                if (assignment !== undefined && assignment.target.Parent === undefined) {
                    orb.assignment = undefined;
                }

                orb.angle = (orb.angle + nanobot.orbitSpeed * dt) % TAU;
                const bob = math.sin(elapsed + orb.phase) * nanobot.bobAmplitude;
                const pivotCf = orb.assignment !== undefined ? orb.assignment.target.CFrame : anchorCf;
                const offset = Nanobot.computeOrbitOffset(orb.angle, nanobot.orbitRadius, nanobot.orbitHeight + bob);
                const desired = pivotCf.mul(offset);
                orb.desiredCFrame = desired;
                if (!orb.traveling) {
                    const current = orb.part.CFrame;
                    const blend = math.clamp(1 - math.exp(-nanobot.orbitSmoothing * dt), 0, 1);
                    orb.part.CFrame = current.Lerp(desired, blend);
                }
            }

            return undefined;
        });

        model.Destroying.Once(() => {
            for (const orb of orbs) {
                if (orb.part.Parent !== undefined) {
                    TweenService.Create(orb.part, tweenInfo, { Transparency: 1 }).Play();
                    task.delay(tweenInfo.Time, () => orb.part.Destroy());
                }
            }
        });
    }

    private static startRepairLoop(model: Model, anchor: BasePart, orbs: NanobotOrbState[], nanobot: Nanobot) {
        const itemService = Server.Item;

        nanobot.item.repeat(
            model,
            () => {
                if (itemService === undefined) return;
                const candidates = nanobot.collectNearbyBroken(anchor.Position);
                if (candidates.size() === 0) {
                    for (const orb of orbs) {
                        if (orb.assignment !== undefined) {
                            Nanobot.releaseOrb(orb, anchor, nanobot);
                        }
                    }
                    return;
                }

                const infoById = new Map<string, { placementId: string; target: BasePart }>();
                for (const info of candidates) {
                    infoById.set(info.placementId, info);
                }

                for (const orb of orbs) {
                    const assignment = orb.assignment;
                    if (assignment === undefined) continue;

                    const info = infoById.get(assignment.placementId);
                    if (info === undefined) {
                        Nanobot.releaseOrb(orb, anchor, nanobot);
                        continue;
                    }

                    assignment.target = info.target;
                    infoById.delete(assignment.placementId);

                    if (nanobot.rng.NextNumber() > nanobot.repairChance) continue;
                    if (!itemService.completeRepair(assignment.placementId, nanobot.repairTier)) continue;

                    switch (nanobot.repairTier) {
                        case "Good":
                            playSound("repair/Good.mp3", model.PrimaryPart, (sound) => (sound.Volume = 0.15));
                            break;
                        case "Great":
                            playSound("repair/Great.mp3", model.PrimaryPart, (sound) => (sound.Volume = 0.15));
                            break;
                        case "Perfect":
                            playSound("repair/Perfect.mp3", model.PrimaryPart, (sound) => (sound.Volume = 0.15));
                            break;
                    }
                    Nanobot.pulseOrb(orb.part);
                    Nanobot.releaseOrb(orb, anchor, nanobot);
                }

                if (infoById.size() === 0) return;

                const unclaimed = new Array<{ placementId: string; target: BasePart }>();
                for (const [, info] of infoById) {
                    unclaimed.push(info);
                }

                for (const orb of orbs) {
                    if (unclaimed.size() === 0) break;
                    if (orb.assignment !== undefined || orb.traveling) continue;

                    const index = nanobot.rng.NextInteger(1, unclaimed.size()) - 1;
                    const info = unclaimed[index];
                    unclaimed[index] = unclaimed[unclaimed.size() - 1];
                    unclaimed.pop();

                    Nanobot.dispatchOrb(anchor, orb, info, nanobot);
                }
            },
            1,
        );
    }

    private collectNearbyBroken(origin: Vector3) {
        const itemService = Server.Item;
        const candidates = new Array<{
            placementId: string;
            target: BasePart;
        }>();
        if (itemService === undefined) return candidates;

        const broken = itemService.getBrokenPlacedItems();
        for (const placementId of broken) {
            const model = itemService.modelPerPlacementId.get(placementId);
            if (model === undefined) continue;
            const targetPart = Nanobot.findAnchor(model);
            if (targetPart === undefined) continue;

            const distance = targetPart.Position.sub(origin).Magnitude;
            if (distance <= this.repairRange) {
                candidates.push({ placementId, target: targetPart });
            }
        }
        return candidates;
    }

    private static computeOrbitOffset(angle: number, radius: number, height: number) {
        return CFrame.Angles(0, angle, 0).mul(new CFrame(0, height, radius));
    }

    private static dispatchOrb(
        anchor: BasePart,
        orb: NanobotOrbState,
        info: { placementId: string; target: BasePart },
        nanobot: Nanobot,
    ) {
        if (orb.assignment?.placementId === info.placementId) {
            orb.assignment.target = info.target;
            return;
        }

        if (orb.activeTween !== undefined) {
            orb.activeTween.Cancel();
            orb.activeTween = undefined;
        }

        orb.assignment = { placementId: info.placementId, target: info.target };
        orb.traveling = true;

        const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
        const targetCFrame = info.target.CFrame.mul(
            Nanobot.computeOrbitOffset(orb.angle, nanobot.orbitRadius, nanobot.orbitHeight),
        );

        const goTween = TweenService.Create(orb.part, tweenInfo, { CFrame: targetCFrame });
        orb.activeTween = goTween;
        goTween.Completed.Once((state) => {
            orb.activeTween = undefined;

            if (orb.assignment === undefined) return;

            if (state === Enum.PlaybackState.Completed) {
                orb.traveling = false;
            } else {
                Nanobot.releaseOrb(orb, anchor, nanobot);
            }
        });

        goTween.Play();
    }

    format(str: string) {
        str = super.format(str);
        const chancePercent = math.round(this.repairChance * 100);
        str = str.gsub("%%repair_chance%%", `${chancePercent}%%`)[0];
        str = str.gsub("%%repair_range%%", tostring(math.round(this.repairRange)))[0];
        str = str.gsub("%%repair_tier%%", this.repairTier)[0];
        return str;
    }

    private static pulseOrb(part: BasePart) {
        if (part.Parent === undefined) return;

        part.Color = ACTIVE_COLOR;
        part.Size = ORB_SIZE.mul(1.15);
        task.delay(0.2, () => {
            if (part.Parent === undefined) return;
            part.Color = BASE_COLOR;
            part.Size = ORB_SIZE;
        });
    }

    private static releaseOrb(orb: NanobotOrbState, anchor: BasePart, nanobot: Nanobot) {
        if (orb.assignment === undefined && orb.activeTween === undefined && !orb.traveling) return;

        if (orb.activeTween !== undefined) {
            orb.activeTween.Cancel();
            orb.activeTween = undefined;
        }

        orb.assignment = undefined;
        const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
        const destination = anchor.CFrame.mul(
            Nanobot.computeOrbitOffset(orb.angle, nanobot.orbitRadius, nanobot.orbitHeight),
        );

        orb.traveling = true;
        const returnTween = TweenService.Create(orb.part, tweenInfo, { CFrame: destination });
        orb.activeTween = returnTween;
        returnTween.Completed.Once(() => {
            orb.traveling = false;
            orb.activeTween = undefined;
        });
        returnTween.Play();
    }
}
