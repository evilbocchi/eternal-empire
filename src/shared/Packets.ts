import { property, request, signal } from "@antivivi/fletchette";
import { BaseOnoeNum } from "@antivivi/serikanum";
import { DataType } from "@rbxts/flamework-binary-serializer";
import type { PlayerProfileTemplate } from "server/services/serverdata/DataService";

declare global {
    interface Reward {
        items?: Map<string, number>,
        xp?: number,
        area?: AreaId,
    }
    
    type QuestInfo = {
        name: string,
        colorR: DataType.f32,
        colorG: DataType.f32,
        colorB: DataType.f32,
        level: DataType.f64,
        length: DataType.i8,
        reward: Reward,
        order: DataType.i32,
        stages: Array<StageInfo>
    }
    
    type StageInfo = {
        description: string,
        npcHumanoid?: Humanoid
    }

    type PlacingInfo = {
        itemId: string,
        position: Vector3,
        rotation: DataType.u16
    }
}

type PackedInventory = DataType.Packed<Inventory>;
type PackedPlacedItem = DataType.Packed<PlacedItem>;
class Packets {

    // data management
    static readonly savingEmpire = signal<(status: DataType.u16) => void>();
    static readonly availableEmpires = property<Map<string, EmpireInfo>>(new Map<string, EmpireInfo>());
    static readonly createNewEmpire = request<() => boolean>();
    static readonly teleportToEmpire = signal<(empireId: string) => void>();
    static readonly promptRename = request<(name: string, method: string) => boolean>();
    static readonly renameCost = property<BaseOnoeNum>();
    static readonly empireName = property<string>();

    // items
    static readonly inventory = property<PackedInventory>();
    static readonly bought = property<PackedInventory>();
    static readonly placedItems = property<Map<string, PackedPlacedItem>>();
    static readonly buyItem = request<(itemId: string) => boolean>();
    static readonly buyAllItems = request<(itemIds: string[]) => boolean>();
    static readonly placeItems = request<(items: PlacingInfo[]) => number>();
    
    static readonly unplaceItems = signal<(placementIds: string[]) => void>();
    static readonly boostChanged = signal<(boostPerItem: Map<string, BaseOnoeNum>) => void>(true);

    // droplets
    static readonly dropletAdded = signal<(drop: BasePart) => void>(true);
    static readonly dropletBurnt = signal<(dropletModelId: string, amountPerCurrency: Map<Currency, BaseOnoeNum>) => void>(true);

    // currencies
    static readonly balance = property<Map<Currency, BaseOnoeNum>>(new Map(), true);
    static readonly mostBalance = property<Map<Currency, BaseOnoeNum>>(new Map(), true);
    static readonly revenue = property<Map<Currency, BaseOnoeNum>>(new Map(), true);

    // upgrade board
    static readonly upgrades = property<Map<string, DataType.i32>>(new Map());
    static readonly buyUpgrade = request<(upgradeId: string, to: DataType.i32 | undefined) => boolean>();

    // resets
    static readonly reset = signal<(layer: ResetLayerId, amount: BaseOnoeNum) => void>();
    static readonly printedSetups = property<Array<Setup>>();
    static readonly renameSetup = signal<(currentName: string, renameTo: string) => void>();
    static readonly autoloadSetup = signal<(name: string) => void>();
    static readonly startChallenge = signal<(challenge: string) => void>();
    static readonly quitChallenge = signal<() => void>();
    static readonly currentChallenge = property<{name: string, r1: DataType.f32, g1: DataType.f32, b1: DataType.f32, r2: DataType.f32, g2: DataType.f32, b2: DataType.f32, description: string}>();
    static readonly challengeCompleted = signal<(challenge: string, rewardLabel: string) => void>();

    // areas
    static readonly tpToArea = request<(area: AreaId) => boolean>();
    static readonly areaUnlocked = signal<(area: AreaId) => void>();
    static readonly dropletCountChanged = signal<(area: AreaId, current: number) => void>(true);

    // quests
    static readonly questInfo = property<Map<string, DataType.Packed<QuestInfo>>>();
    static readonly stageInfo = property<Map<string, Map<number, StageInfo>>>();
    static readonly quests = property<Map<string, DataType.i32>>(new Map());
    static readonly questCompleted = signal<(questId: string) => void>();
    static readonly remainingLevelPoints = property<DataType.i32>(-1);
    static readonly level = property<DataType.i32>(-1);
    static readonly xp = property<DataType.i32>(-1);
    static readonly getUpgrade = request<(upgradeId: string, amount: DataType.i32) => boolean>();

    // playtime
    static readonly longestSessionTime = property<DataType.i32>(0, true);
    static readonly sessionTime = property<DataType.i32>(0, true);
    static readonly empirePlaytime = property<DataType.i32>(0, true);
    static readonly playerPlaytime = property<DataType.i32>(0, true);

    // permissions
    static readonly permLevels = property<{[key in PermissionKey]?: number}>({});
    static readonly getLogs = request<() => Log[]>();
    static readonly systemMessageSent = signal<(channel: string, message: string, metadata: string) => void>();
    static readonly codeReceived = signal<(code: string) => void>();
    static readonly tabOpened = signal<(tab: string) => void>();
    static readonly donationGiven = signal<() => void>();
    static readonly promptDonation = signal<(donationId: DataType.i32) => void>();
    static readonly logAdded = signal<(log: Log) => void>();

    // settings
    static readonly settings = property<DataType.Packed<typeof PlayerProfileTemplate.settings>>();
    static readonly setSetting = signal<<T extends keyof Settings>(setting: T, value: Settings[T]) => void>();
    static readonly setHotkey = signal<(name: string, key: DataType.i32) => void>();

    // npcs
    static readonly nextDialogue = request<() => boolean>();
    static readonly npcMessage = signal<(npc: Instance, message: string, pos: number, end: number, prompt: boolean) => void>();

    // chests
    static readonly itemsReceived = signal<(items: Map<string, number>) => void>();
    static readonly xpReceived = signal<(xp: number) => void>();

    // bombs
    static readonly useBomb = request<(bombType: Currency) => boolean>();

    // tools
    static readonly useTool = signal<(harvestable: Instance) => void>(true);

    // visual
    static readonly camShake = signal<() => void>();

    // admin
    static readonly modifyGame = signal<(param: string) => void>();
}

export = Packets;