import { RunService, TweenService } from "@rbxts/services";
import { packet } from "@rbxts/fletchette";
import { Server } from "shared/api/APIExpose";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import type { RepairResultTier } from "shared/item/repair";
import ItemTrait from "shared/item/traits/ItemTrait";
import perItemPacket from "shared/item/utils/perItemPacket";

declare global {
    interface ItemTraits {
        Nanobot: Nanobot;
    }
}

interface NanobotOrbState {
    angle: number;
    phase: number;
    traveling: boolean;
    travelDeadline?: number;
    desiredCFrame?: CFrame;
    assignment?: {
        placementId: string;
        target: BasePart;
    };
}

interface NanobotClientOrbState extends NanobotOrbState {
    part: BasePart;
    activeTween?: Tween;
    pendingPlacementId?: string;
}

interface NanobotClientEntry {
    model: Model;
    anchor: BasePart;
    orbs: NanobotClientOrbState[];
    nanobot: Nanobot;
    elapsed: number;
}

type NanobotOrbEvent =
    | { type: "dispatch"; index: number; targetPlacementId: string }
    | { type: "release"; index: number }
    | { type: "pulse"; index: number }
    | { type: "repair"; tier: RepairResultTier };

const TAU = math.pi * 2;
const BASE_COLOR = Color3.fromRGB(110, 205, 255);
const ACTIVE_COLOR = Color3.fromRGB(130, 255, 205);
const ORB_SIZE = new Vector3(1.8, 1.8, 1.8);
const RETURN_TWEEN_INFO = new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
const FADE_TWEEN_INFO = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

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

    private static readonly orbPacket = perItemPacket(
        packet<(placementId: string, event: NanobotOrbEvent) => void>({ isUnreliable: true }),
    );

    private static readonly clientEntries = new Map<Model, NanobotClientEntry>();
    private static heartbeatConnection?: RBXScriptConnection;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Nanobot.load(model, this));
        item.onClientLoad((model) => Nanobot.clientLoad(model, this));
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

        const orbs = Nanobot.createOrbStates(nanobot);
        Nanobot.animateServerOrbs(model, anchor, orbs, nanobot);
        Nanobot.startRepairLoop(model, anchor, orbs, nanobot);
    }

    private static clientLoad(model: Model, nanobot: Nanobot) {
        const anchor = Nanobot.findAnchor(model);
        if (anchor === undefined) return;

        const orbs = Nanobot.createClientOrbs(model, nanobot);
        Nanobot.registerClientEntry(model, anchor, orbs, nanobot);

        Nanobot.orbPacket.fromServer(model, (event) => {
            const entry = Nanobot.clientEntries.get(model);
            if (entry === undefined) return;
            switch (event.type) {
                case "dispatch":
                    Nanobot.handleDispatchEvent(entry, event);
                    break;
                case "release":
                    Nanobot.handleReleaseEvent(entry, event);
                    break;
                case "pulse":
                    Nanobot.handlePulseEvent(entry, event);
                    break;
                case "repair":
                    Nanobot.handleRepairEvent(entry, event);
                    break;
            }
        });
    }

    private static findAnchor(model: Model) {
        return model.PrimaryPart ?? (model.FindFirstChildWhichIsA("BasePart") as BasePart | undefined);
    }

    private static createOrbStates(nanobot: Nanobot) {
        const orbs = new Array<NanobotOrbState>();
        for (let i = 0; i < nanobot.orbCount; i++) {
            orbs.push({
                angle: (TAU / nanobot.orbCount) * i,
                phase: (TAU / nanobot.orbCount) * i,
                traveling: false,
            });
        }
        return orbs;
    }

    private static createClientOrbs(model: Model, nanobot: Nanobot) {
        const modelCFrame = model.GetPivot();
        const folder = new Instance("Folder");
        folder.Name = "NanobotOrbs";
        folder.Parent = model;

        const baseStates = Nanobot.createOrbStates(nanobot);
        const orbs = new Array<NanobotClientOrbState>();
        for (let i = 0; i < baseStates.size(); i++) {
            const state = baseStates[i];
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
            part.CFrame = modelCFrame;
            part.Parent = folder;

            orbs.push({ ...state, part });
        }

        model.Destroying.Once(() => {
            folder.Destroy();
            Nanobot.clientEntries.delete(model);
        });
        return orbs;
    }

    private static ensureClientHeartbeat() {
        if (Nanobot.heartbeatConnection !== undefined) return;
        Nanobot.heartbeatConnection = RunService.Heartbeat.Connect((dt) => {
            for (const [, entry] of Nanobot.clientEntries) {
                const { orbs, nanobot } = entry;

                entry.elapsed += dt * nanobot.bobSpeed;

                if (entry.anchor.Parent === undefined) {
                    const replacement = Nanobot.findAnchor(entry.model);
                    if (replacement === undefined) {
                        Nanobot.unregisterClientEntry(entry.model);
                        continue;
                    }
                    entry.anchor = replacement;
                }

                const anchorCf = entry.anchor.CFrame;

                for (const orb of orbs) {
                    if (orb.assignment !== undefined && orb.assignment.target.Parent === undefined) {
                        orb.pendingPlacementId = orb.assignment.placementId;
                        orb.assignment = undefined;
                    }

                    if (orb.assignment === undefined && orb.pendingPlacementId !== undefined) {
                        const targetModel = Nanobot.findTargetModel(entry.model, orb.pendingPlacementId);
                        const targetAnchor = targetModel !== undefined ? Nanobot.findAnchor(targetModel) : undefined;
                        if (targetAnchor !== undefined) {
                            orb.assignment = { placementId: orb.pendingPlacementId, target: targetAnchor };
                            orb.pendingPlacementId = undefined;
                        }
                    }

                    orb.angle = (orb.angle + nanobot.orbitSpeed * dt) % TAU;
                    const bob = math.sin(entry.elapsed + orb.phase) * nanobot.bobAmplitude;
                    const pivotCf = orb.assignment !== undefined ? orb.assignment.target.CFrame : anchorCf;
                    const offset = Nanobot.computeOrbitOffset(
                        orb.angle,
                        nanobot.orbitRadius,
                        nanobot.orbitHeight + bob,
                    );
                    const desired = pivotCf.mul(offset);
                    orb.desiredCFrame = desired;
                    if (!orb.traveling) {
                        const current = orb.part.CFrame;
                        const blend = math.clamp(1 - math.exp(-nanobot.orbitSmoothing * dt), 0, 1);
                        orb.part.CFrame = current.Lerp(desired, blend);
                    }
                }
            }

            if (Nanobot.clientEntries.size() === 0) {
                Nanobot.cleanupHeartbeat();
            }
        });
    }

    private static cleanupHeartbeat() {
        if (Nanobot.heartbeatConnection !== undefined) {
            Nanobot.heartbeatConnection.Disconnect();
            Nanobot.heartbeatConnection = undefined;
        }
    }

    private static registerClientEntry(
        model: Model,
        anchor: BasePart,
        orbs: NanobotClientOrbState[],
        nanobot: Nanobot,
    ) {
        const entry: NanobotClientEntry = {
            model,
            anchor,
            orbs,
            nanobot,
            elapsed: 0,
        };
        Nanobot.clientEntries.set(model, entry);
        Nanobot.ensureClientHeartbeat();

        model.Destroying.Once(() => {
            Nanobot.unregisterClientEntry(model);
        });
    }

    private static unregisterClientEntry(model: Model) {
        const entry = Nanobot.clientEntries.get(model);
        if (entry === undefined) return;
        Nanobot.clientEntries.delete(model);
        Nanobot.fadeOutOrbs(entry.orbs);
        if (Nanobot.clientEntries.size() === 0) {
            Nanobot.cleanupHeartbeat();
        }
    }

    private static fadeOutOrbs(orbs: NanobotClientOrbState[]) {
        for (const orb of orbs) {
            if (orb.activeTween !== undefined) {
                orb.activeTween.Cancel();
                orb.activeTween = undefined;
            }
            if (orb.part.Parent !== undefined) {
                TweenService.Create(orb.part, FADE_TWEEN_INFO, { Transparency: 1 }).Play();
                task.delay(FADE_TWEEN_INFO.Time, () => {
                    if (orb.part.Parent !== undefined) {
                        orb.part.Destroy();
                    }
                });
            }
        }
    }

    private static animateServerOrbs(model: Model, anchor: BasePart, orbs: NanobotOrbState[], nanobot: Nanobot) {
        let elapsed = 0;

        nanobot.item.repeat(model, (dt) => {
            elapsed += dt * nanobot.bobSpeed;
            const anchorCf = anchor.CFrame;
            const now = os.clock();

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
                if (orb.traveling && orb.travelDeadline !== undefined && now >= orb.travelDeadline) {
                    orb.traveling = false;
                    orb.travelDeadline = undefined;
                }
            }

            return undefined;
        });
    }

    private static startRepairLoop(model: Model, anchor: BasePart, orbs: NanobotOrbState[], nanobot: Nanobot) {
        const itemService = Server.Item;

        nanobot.item.repeat(
            model,
            () => {
                if (itemService === undefined) return;
                const now = os.clock();
                for (const orb of orbs) {
                    if (orb.traveling && orb.travelDeadline !== undefined && now >= orb.travelDeadline) {
                        orb.traveling = false;
                        orb.travelDeadline = undefined;
                    }
                }
                const candidates = nanobot.collectNearbyBroken(anchor.Position);
                if (candidates.size() === 0) {
                    for (let index = 0; index < orbs.size(); index++) {
                        const orb = orbs[index];
                        if (orb.assignment !== undefined) {
                            Nanobot.releaseOrb(model, orb, anchor, nanobot, index);
                        }
                    }
                    return;
                }

                const infoById = new Map<string, { placementId: string; target: BasePart }>();
                for (const info of candidates) {
                    infoById.set(info.placementId, info);
                }

                for (let index = 0; index < orbs.size(); index++) {
                    const orb = orbs[index];
                    const assignment = orb.assignment;
                    if (assignment === undefined) continue;

                    const info = infoById.get(assignment.placementId);
                    if (info === undefined) {
                        Nanobot.releaseOrb(model, orb, anchor, nanobot, index);
                        continue;
                    }

                    assignment.target = info.target;
                    infoById.delete(assignment.placementId);

                    if (nanobot.rng.NextNumber() > nanobot.repairChance) continue;
                    if (!itemService.completeRepair(assignment.placementId, nanobot.repairTier)) continue;

                    Nanobot.notifyRepair(model, nanobot.repairTier);
                    Nanobot.pulseOrb(model, index);
                    Nanobot.releaseOrb(model, orb, anchor, nanobot, index);
                }

                if (infoById.size() === 0) return;

                const unclaimed = new Array<{ placementId: string; target: BasePart }>();
                for (const [, info] of infoById) {
                    unclaimed.push(info);
                }

                for (let index = 0; index < orbs.size(); index++) {
                    const orb = orbs[index];
                    if (unclaimed.size() === 0) break;
                    if (orb.assignment !== undefined || orb.traveling) continue;

                    const pickIndex = nanobot.rng.NextInteger(1, unclaimed.size()) - 1;
                    const info = unclaimed[pickIndex];
                    unclaimed[pickIndex] = unclaimed[unclaimed.size() - 1];
                    unclaimed.pop();

                    Nanobot.dispatchOrb(model, anchor, orb, info, nanobot, index);
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
        model: Model,
        anchor: BasePart,
        orb: NanobotOrbState,
        info: { placementId: string; target: BasePart },
        nanobot: Nanobot,
        index: number,
    ) {
        if (orb.assignment?.placementId === info.placementId) {
            orb.assignment.target = info.target;
            return;
        }

        orb.assignment = { placementId: info.placementId, target: info.target };
        orb.traveling = true;
        orb.travelDeadline = os.clock() + RETURN_TWEEN_INFO.Time;

        Nanobot.orbPacket.toAllClients(model, { type: "dispatch", index, targetPlacementId: info.placementId });
    }

    format(str: string) {
        str = super.format(str);
        const chancePercent = math.round(this.repairChance * 100);
        str = str.gsub("%%repair_chance%%", `${chancePercent}%%`)[0];
        str = str.gsub("%%repair_range%%", tostring(math.round(this.repairRange)))[0];
        str = str.gsub("%%repair_tier%%", this.repairTier)[0];
        return str;
    }

    private static pulseOrb(model: Model, index: number) {
        Nanobot.orbPacket.toAllClients(model, { type: "pulse", index });
    }

    private static releaseOrb(model: Model, orb: NanobotOrbState, anchor: BasePart, nanobot: Nanobot, index: number) {
        if (orb.assignment === undefined && !orb.traveling) return;

        orb.assignment = undefined;
        orb.traveling = true;
        orb.travelDeadline = os.clock() + RETURN_TWEEN_INFO.Time;

        Nanobot.orbPacket.toAllClients(model, { type: "release", index });
    }

    private static notifyRepair(model: Model, tier: RepairResultTier) {
        Nanobot.orbPacket.toAllClients(model, { type: "repair", tier });
    }

    private static handleDispatchEvent(
        entry: NanobotClientEntry,
        event: Extract<NanobotOrbEvent, { type: "dispatch" }>,
    ) {
        const { model, orbs, nanobot } = entry;
        const orb = orbs[event.index];
        if (orb === undefined) return;

        if (orb.activeTween !== undefined) {
            orb.activeTween.Cancel();
            orb.activeTween = undefined;
        }

        const targetModel = Nanobot.findTargetModel(model, event.targetPlacementId);
        const targetAnchor = targetModel !== undefined ? Nanobot.findAnchor(targetModel) : undefined;
        if (targetAnchor === undefined) {
            orb.assignment = undefined;
            orb.pendingPlacementId = event.targetPlacementId;
            orb.traveling = false;
            return;
        }

        orb.assignment = { placementId: event.targetPlacementId, target: targetAnchor };
        orb.pendingPlacementId = undefined;
        const targetCFrame = targetAnchor.CFrame.mul(
            Nanobot.computeOrbitOffset(orb.angle, nanobot.orbitRadius, nanobot.orbitHeight),
        );

        const tween = TweenService.Create(orb.part, RETURN_TWEEN_INFO, { CFrame: targetCFrame });
        orb.activeTween = tween;
        orb.traveling = true;
        tween.Completed.Once((state) => {
            if (orb.activeTween === tween) {
                orb.activeTween = undefined;
            }
            orb.traveling = false;
            if (state === Enum.PlaybackState.Completed) {
                orb.part.CFrame = targetCFrame;
            }
        });
        tween.Play();
    }

    private static handleReleaseEvent(entry: NanobotClientEntry, event: Extract<NanobotOrbEvent, { type: "release" }>) {
        const { anchor, orbs, nanobot } = entry;
        const orb = orbs[event.index];
        if (orb === undefined) return;

        if (orb.activeTween !== undefined) {
            orb.activeTween.Cancel();
            orb.activeTween = undefined;
        }

        orb.assignment = undefined;
        orb.pendingPlacementId = undefined;

        const destination = anchor.CFrame.mul(
            Nanobot.computeOrbitOffset(orb.angle, nanobot.orbitRadius, nanobot.orbitHeight),
        );

        const tween = TweenService.Create(orb.part, RETURN_TWEEN_INFO, { CFrame: destination });
        orb.activeTween = tween;
        orb.traveling = true;
        tween.Completed.Once(() => {
            if (orb.activeTween === tween) {
                orb.activeTween = undefined;
            }
            orb.traveling = false;
        });
        tween.Play();
    }

    private static handlePulseEvent(entry: NanobotClientEntry, event: Extract<NanobotOrbEvent, { type: "pulse" }>) {
        const orb = entry.orbs[event.index];
        if (orb === undefined) return;
        Nanobot.applyPulse(orb.part);
    }

    private static handleRepairEvent(entry: NanobotClientEntry, event: Extract<NanobotOrbEvent, { type: "repair" }>) {
        const anchor = entry.anchor;
        const model = entry.model;
        const origin = anchor.Parent !== undefined ? anchor : (model.PrimaryPart ?? anchor);
        Nanobot.playRepairSound(origin, event.tier);
    }

    private static playRepairSound(origin: BasePart | undefined, tier: RepairResultTier) {
        const volume = 0.15;
        switch (tier) {
            case "Good":
                playSound("repair/Good.mp3", origin, (sound) => (sound.Volume = volume));
                break;
            case "Great":
                playSound("repair/Great.mp3", origin, (sound) => (sound.Volume = volume));
                break;
            case "Perfect":
                playSound("repair/Perfect.mp3", origin, (sound) => (sound.Volume = volume));
                break;
        }
    }

    private static applyPulse(part: BasePart) {
        if (part.Parent === undefined) return;

        part.Color = ACTIVE_COLOR;
        part.Size = ORB_SIZE.mul(1.15);
        task.delay(0.2, () => {
            if (part.Parent === undefined) return;
            part.Color = BASE_COLOR;
            part.Size = ORB_SIZE;
        });
    }

    private static findTargetModel(model: Model, placementId: string) {
        const parent = model.Parent;
        if (parent === undefined) return undefined;
        const instance = parent.FindFirstChild(placementId);
        if (instance === undefined || !instance.IsA("Model")) return undefined;
        return instance;
    }
}
