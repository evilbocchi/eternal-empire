import { OnInit, OnStart, Service } from "@flamework/core";
import { Profile } from "@rbxts/profileservice/globals";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import { DataService, EmpireProfileTemplate } from "server/services/serverdata/DataService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import { LevelService } from "server/services/serverdata/LevelService";
import { UnlockedAreasService } from "server/services/serverdata/UnlockedAreasService";
import { AREAS, ASSETS, XP_PACKS, getSound } from "shared/constants";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Gold from "shared/items/excavation/Gold";
import Iron from "shared/items/excavation/Iron";
import WhiteGem from "shared/items/excavation/WhiteGem";
import { Fletchette, RemoteSignal } from "@antivivi/fletchette";
import { weldModel } from "shared/utils/vrldk/BasePartUtils";
import { convertToMMSS } from "shared/utils/vrldk/NumberAbbreviations";

declare global {
    interface FletchetteCanisters {
        ChestCanister: typeof ChestCanister;
    }
}

type Loot = keyof (typeof XP_PACKS) | Item;
type LootPool = Map<Loot, number>;

export const ChestCanister = Fletchette.createCanister("ChestCanister", {
    xpReceived: new RemoteSignal<(xp: number) => void>(),
    itemReceived: new RemoteSignal<(itemId: string) => void>(),
});

@Service()
export class ChestService implements OnInit, OnStart {

    poolPerLevel = new Map<number, LootPool>();
    cooldown = 900;
    chestPerChestLocation = new Map<Vector3, typeof ASSETS.Chest>();
    openTweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

    constructor(private dataService: DataService, private levelService: LevelService, private itemsService: ItemsService, private unlockedAreasService: UnlockedAreasService) {

    }

    round(vector3: Vector3) {
        return new Vector3(math.round(vector3.X), math.round(vector3.Y), math.round(vector3.Z));
    }

    markLastOpen(chestLocation: Vector3, lastOpen: number) {
        const chest = this.chestPerChestLocation.get(chestLocation);
        if (chest === undefined)
            return false;
        const bindableEvent = chest.FindFirstChild("MarkLastOpen") as BindableEvent;
        if (bindableEvent === undefined)
            error("Wtf");
        bindableEvent.Fire(lastOpen);
        return true;
    }

    getTotalWeight(pool: LootPool) {
        let totalWeight = 0;
        for (const [_piece, weight] of pool) {
            totalWeight += weight;
        }
        return totalWeight;
    }

    randomFromPool(pool: LootPool, totalWeight?: number) {
        if (totalWeight === undefined) {
            totalWeight = this.getTotalWeight(pool);
        }
        const chance = math.random(1, totalWeight);
        let counter = 0;
        for (const [piece, weight] of pool) {
            counter += weight;
            if (chance < counter)
                return piece;
        }
        error("What the sigma");
    }

    pool(pool: LootPool, amount?: number) {
        const totalWeight = this.getTotalWeight(pool);
        const loot = new Array<Loot>();
        for (let i = 0; i < (amount ?? 5); i++) {
            loot.push(this.randomFromPool(pool, totalWeight));
        }
        return loot;
    }

    rewardLoot(loot: Loot) {
        if (typeOf(loot) === "string") {
            const xp = XP_PACKS[loot as keyof (typeof XP_PACKS)];
            const current = this.levelService.getXp();
            if (current === undefined)
                error("WAT THE FAQ");
            this.levelService.setXp(current + xp);
            ChestCanister.xpReceived.fireAll(xp);
        }
        else {
            const itemId = (loot as Item).id;
            this.itemsService.setItemAmount(itemId, this.itemsService.getItemAmount(itemId) + 1);
            ChestCanister.itemReceived.fireAll(itemId);
        }
    }
    
    onInit() {
        const l1 = new Map() as LootPool;
        l1.set("T1_XP", 2000);
        l1.set("T2_XP", 1000);
        l1.set("T3_XP", 500);
        l1.set(ExcavationStone, 1000);
        l1.set(WhiteGem, 200);
        l1.set(Crystal, 50);
        l1.set(Iron, 10);
        l1.set(Gold, 1);
        this.poolPerLevel.set(1, l1);

        for (const [_id, area] of pairs(AREAS)) {
            const chestsFolder = area.areaFolder.FindFirstChild("Chests");
            if (chestsFolder === undefined)
                continue;
            const chestLocations = chestsFolder.GetChildren();
            for (const chestLocationMarker of chestLocations) {
                if (!chestLocationMarker.IsA("BasePart"))
                    continue;
                chestLocationMarker.FrontSurface = Enum.SurfaceType.Smooth;
                chestLocationMarker.Transparency = 1;
                const chestModel = ASSETS.Chest.Clone();
                chestModel.PivotTo(chestLocationMarker.CFrame);
                const sound = getSound("ChestOpen").Clone();
                sound.Parent = chestModel.PrimaryPart;

                const prompt = new Instance("ProximityPrompt");
                prompt.ActionText = "Open";
                prompt.ObjectText = "Chest";
                prompt.RequiresLineOfSight = false;
                prompt.MaxActivationDistance = 6;
                const bp = weldModel(chestModel.Lid);
                const originalLidPivot = bp.CFrame;
                let lastOpen = 0;
                let isOpened = false;
                const markLastOpen = (lo: number) => {
                    lastOpen = lo;
                    isOpened = tick() - lastOpen < this.cooldown;
                    TweenService.Create(bp, this.openTweenInfo, { CFrame: isOpened ? originalLidPivot.mul(CFrame.Angles(-1, 0, 0)) : originalLidPivot }).Play();
                    prompt.Enabled = !isOpened;
                    chestModel.Hitbox.CooldownGui.Enabled = isOpened;
                }
                RunService.Heartbeat.Connect(() => {
                    const elapsed = tick() - lastOpen;
                    if (elapsed > this.cooldown && isOpened === true) {
                        isOpened = false;
                        markLastOpen(lastOpen);
                    }
                    if (isOpened) {
                        chestModel.Hitbox.CooldownGui.CooldownLabel.Text = convertToMMSS(math.floor(this.cooldown - elapsed));
                    }
                });
                const bindableEvent = new Instance("BindableEvent");
                bindableEvent.Name = "MarkLastOpen";
                bindableEvent.Event.Connect((lastOpen: number) => markLastOpen(lastOpen));
                bindableEvent.Parent = chestModel;
                const chestLocation = this.round(chestLocationMarker.Position);
                this.chestPerChestLocation.set(chestLocation, chestModel);
                prompt.Triggered.Connect(() => {
                    if (!prompt.Enabled)
                        return;
                    if (this.unlockedAreasService.getUnlockedAreas()?.has(area.name as keyof (typeof AREAS)))
                        return;
                    sound.Play();
                    const t = tick();
                    const profile = this.dataService.empireProfile;
                    if (profile === undefined)
                        return;
                    const amount = lastOpen === 0 ? math.random(4, 5) : math.random(2, 3);
                    const pooled = this.pool(this.poolPerLevel.get(tonumber(chestLocationMarker.Name) ?? 1)!, amount);
                    profile.Data.openedChests.set(`${chestLocation.X}_${chestLocation.Y}_${chestLocation.Z}`, t);
                    markLastOpen(t);
                    task.spawn(() => {
                        task.wait(0.25);
                        for (const loot of pooled) {
                            task.wait(1.25 / amount);
                            this.rewardLoot(loot);
                        }
                    });
                });
                
                prompt.Parent = chestModel.PrimaryPart;
                chestModel.Parent = Workspace;
            }
        }
    }

    onStart() {
        const onProfileLoaded = (profile: Profile<typeof EmpireProfileTemplate>) => {
            const lastOpenPerLocation = profile.Data.openedChests;
            for (const [location, lastOpen] of lastOpenPerLocation) {
                const [xString, yString, zString] = location.split("_");
                if (this.markLastOpen(new Vector3(tonumber(xString), tonumber(yString), tonumber(zString)), lastOpen) === false) {
                    lastOpenPerLocation.delete(location);
                }
            }
        }
        if (this.dataService.empireProfile !== undefined)
            onProfileLoaded(this.dataService.empireProfile);
        this.dataService.empireProfileLoaded.connect((profile) => onProfileLoaded(profile));
    }
}