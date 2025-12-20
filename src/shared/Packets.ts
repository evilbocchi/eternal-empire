import type CameraShaker from "@rbxts/camera-shaker";
import type { DataType } from "@rbxts/flamework-binary-serializer";
import { exactMapProperty, exactSetProperty, FletchetteEnvironment, packet, property } from "@rbxts/fletchette";
import type { BaseOnoeNum } from "@rbxts/serikanum";
import { OnoeNum } from "@rbxts/serikanum";
import type { LeaderboardEntry, LeaderboardType } from "client/components/world/leaderboard/Leaderboard";
import { IS_EDIT } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import EmpireProfileTemplate from "shared/data/profile/EmpireProfileTemplate";
import PlayerProfileTemplate from "shared/data/profile/PlayerProfileTemplate";
import type { RepairResultTier } from "shared/item/repair";

declare global {
    interface Reward {
        items?: Map<string, number>;
        xp?: number;
        area?: AreaId;
    }

    type QuestInfo = {
        name: string;
        colorR: DataType.u8;
        colorG: DataType.u8;
        colorB: DataType.u8;
        level: DataType.f64;
        length: DataType.i8;
        reward: Reward;
        order: DataType.i32;
        stages: Array<StageInfo>;
    };

    type StageInfo = {
        description: string;
    };

    type PlacingInfo = {
        id: string;
        position: Vector3;
        rotation: DataType.u16;
    };

    type LootInfo = { id: string | "xp"; amount: number };
}

const unloadedSettings = table.clone(PlayerProfileTemplate.settings);
unloadedSettings.Music = false; // disable music until we load settings

type DebugStatsPayload = {
    serverTps: number;
    entityCount: number;
    playerCount: number;
    uptimeSeconds: number;
    jobId: string;
    lastUpdated: number;
};

FletchetteEnvironment.setVirtualState(IS_EDIT);

namespace Packets {
    // data management

    /** The empires that are available to the player. */
    export const availableEmpires = property<Map<string, EmpireInfo>>(new Map<string, EmpireInfo>());

    /**
     * Request the server to create a new empire.
     * @returns `true` if the request was successful, `false` otherwise.
     */
    export const createNewEmpire = packet<() => boolean>();

    /**
     * Request the server to enter a specific empire through Roblox's teleport service.
     * @param empireId The ID of the empire to teleport to.
     * @returns `true` if the request was successful, `false` otherwise.
     */
    export const teleportToEmpire = packet<(empireId: string) => boolean>();

    /**
     * Request the server to *prompt* a rename the current empire.
     * This does not immediately rename the empire if method is "robux".
     *
     * @param name The new name for the empire.
     * @param method The method of renaming, either "robux" or "funds".
     * @returns `true` if the request was successful, `false` otherwise.
     */
    export const promptRename = packet<(name: string, method: string) => boolean>();

    /**
     * The cost of renaming the empire in Funds.
     */
    export const renameCost = property<BaseOnoeNum>();

    /**
     * The name of the current empire.
     */
    export const empireName = property<string>(EmpireProfileTemplate.name);

    // items
    /**
     * The inventory of the empire, containing owned items and their quantities.
     * Some items may not be present in the inventory if they are not owned.
     */
    export const inventory = exactMapProperty<string, number>(EmpireProfileTemplate.items.inventory);
    export const researching = exactMapProperty<string, number>(EmpireProfileTemplate.items.researching);
    export const unlockedDifficulties = exactSetProperty<string>(EmpireProfileTemplate.unlockedDifficulties);
    export const difficultyRewardCooldowns = exactMapProperty<string, number>(
        EmpireProfileTemplate.difficultyRewardCooldowns,
    );
    export const difficultyRewardPurchases = exactMapProperty<string, number>(
        EmpireProfileTemplate.difficultyRewardPurchaseCounts,
    );
    export const researchMultiplier = property<BaseOnoeNum>(new OnoeNum(1));
    export const bought = exactMapProperty<string, number>(EmpireProfileTemplate.items.bought);
    export const placedItems = exactMapProperty<string, DataType.Packed<PlacedItem>>(
        EmpireProfileTemplate.items.worldPlaced,
    );
    export const buyItem = packet<(itemId: string) => boolean>();
    export const buyAllItems = packet<(itemIds: Set<string>) => boolean>();
    export const placeItems = packet<(items: Set<PlacingInfo>) => number>();
    export const uniqueInstances = exactMapProperty<string, UniqueItemInstance>(
        EmpireProfileTemplate.items.uniqueInstances,
    );
    export const unplaceItems = packet<(placementIds: Set<string>) => void>();
    export const setBuildPreviewTool = packet<(difficultyId: string) => void>();
    export const boostChanged = packet<(boostPerItem: Map<string, BaseOnoeNum>) => void>({ isUnreliable: true });
    export const brokenPlacedItems = exactSetProperty<string>(EmpireProfileTemplate.items.brokenPlacedItems);
    export const repairItem = packet<(placementId: string, tier: RepairResultTier) => boolean>();
    export const itemRepairCompleted = packet<(placementId: string, tier: RepairResultTier) => void>();
    export const claimDifficultyReward = packet<(rewardId: string) => boolean>();

    // droplets
    export const dropletBurnt = packet<(dropletModelId: string, amountPerCurrency: BaseCurrencyMap) => void>({
        isUnreliable: true,
    });
    export const dropletSurged = packet<(dropletModelId: string) => void>({ isUnreliable: true });
    export const setVelocity = packet<(dropletModelId: string, velocity: Vector3) => void>({ isUnreliable: true });

    // weather
    export const weatherChanged = packet<(weatherState: object) => void>();
    export const getWeatherState = packet<() => object>();

    // currencies
    export const balance = exactMapProperty<Currency, BaseOnoeNum>(EmpireProfileTemplate.currencies, true);
    export const mostBalance = exactMapProperty<Currency, BaseOnoeNum>(EmpireProfileTemplate.mostCurrencies, true);
    export const revenue = exactMapProperty<Currency, BaseOnoeNum>(new Map(), true);
    export const showDifference = packet<(differencePerCurrency: BaseCurrencyMap) => void>();
    export const rawPurifierClicks = property<DataType.u32>(0, true);

    // upgrade board
    export const upgrades = exactMapProperty<string, DataType.i32>(EmpireProfileTemplate.upgrades);
    export const buyUpgrade = packet<(upgradeId: string, to: DataType.i32 | undefined) => boolean>();

    // resets
    export const resetCountdown = packet<(layer: ResetLayerId, countdown: number) => void>();
    export const gainPerResetLayer = exactMapProperty<ResetLayerId, BaseOnoeNum>(new Map());
    export const reset = packet<(layer: ResetLayerId, amount: BaseOnoeNum) => void>();
    export const printedSetups = property<Array<Setup>>(EmpireProfileTemplate.printedSetups);
    export const saveSetup = packet<(printerPlacementId: string, name: string) => boolean>();
    export const loadSetup = packet<(printerPlacementId: string, name: string) => boolean>();
    export const renameSetup = packet<(currentName: string, renameTo: string) => void>();
    export const autoloadSetup = packet<(name: string) => boolean>();
    export const startChallenge = packet<(challenge: string) => void>();
    export const quitChallenge = packet<() => void>();
    export const currentLevelPerChallenge = exactMapProperty<string, DataType.u8>(new Map());
    export const currentChallenge = property<string>();
    export const challengeCompleted = packet<(challenge: string, rewardLabel: string) => void>();

    // areas
    export const currentArea = property<AreaId | undefined>(undefined);
    export const tpToArea = packet<(area: AreaId) => boolean>();
    export const areaUnlocked = packet<(area: AreaId) => void>();
    export const unlockedAreas = exactSetProperty<AreaId>(new Set<AreaId>());
    export const visitedAreas = exactSetProperty<AreaId>(new Set<AreaId>());
    export const dropletCountChanged = packet<(area: AreaId, current: number, max: number) => void>({
        isUnreliable: true,
    });

    // quests
    export const questInfo = property<Map<string, DataType.Packed<QuestInfo>>>();
    export const stagePerQuest = exactMapProperty<string, DataType.i32>(new Map());
    export const questCompleted = packet<(questId: string) => void>();
    export const level = property<DataType.i32>(-1);
    export const xp = property<DataType.i32>(-1);
    export const trackQuest = packet<(questId: string) => void>();

    // playtime
    export const longestSessionTime = property<DataType.i32>(EmpireProfileTemplate.longestSession, true);
    export const sessionTime = property<DataType.i32>(0, true);
    export const empirePlaytime = property<DataType.i32>(EmpireProfileTemplate.playtime, true);
    export const playerPlaytime = property<DataType.i32>(0, true);

    // permissions
    export const permLevel = property<DataType.u8>(0);
    export const permLevels = property<{ [key in PermissionKey]: number }>(EmpireProfileTemplate.permLevels);
    export const getLogs = packet<() => Log[]>();
    export const sendGlobalMessage = packet<(message: string) => void>();
    export const systemMessageSent = packet<(channel: string, message: string, metadata: string) => void>();
    export const codeReceived = packet<(code: string) => void>();
    export const tabOpened = packet<(tab: string) => void>();
    export const donationGiven = packet<() => void>();
    export const promptDonation = packet<(donationId: DataType.i32) => void>();
    export const logsAdded = packet<(logs: Log[]) => void>();

    // settings
    export const settings = property<DataType.Packed<typeof PlayerProfileTemplate.settings>>(unloadedSettings);
    export const setSetting = packet<<T extends keyof Settings>(setting: T, value: Settings[T]) => void>();
    export const setHotkey = packet<(name: string, key: DataType.i32) => void>();
    export const serverMusicEnabled = property<boolean>(true);

    // npcs
    export const nextDialogue = packet<() => boolean>();
    export const npcMessage =
        packet<(message: string, pos: number, end: number, prompt: boolean, npc: Instance) => void>();

    // chests
    /**
     * Show the item reward UI.
     */
    export const showLoot = packet<(loot: LootInfo[]) => void>();

    // leaderboard
    export const leaderboardData = property<Map<LeaderboardType, LeaderboardEntry[]>>(new Map());

    // bombs
    /** The end times for each bomb currency. e.g. "Funds Bombs": 1234567890 */
    export const bombEndTimes = exactMapProperty<Currency, DataType.f64>(new Map());
    export const useBomb = packet<(bombType: Currency) => boolean>();

    // tools
    export interface ToolUsePayload {
        target?: Instance;
    }
    export const useTool = packet<(payload: ToolUsePayload) => void>({ isUnreliable: true });

    // visual
    export const shakeCamera = packet<(presetName: keyof typeof CameraShaker.Presets) => void>();

    // admin
    export const modifyGame = packet<(param: string) => void>();

    // marketplace
    export const createListing = packet<(uuid: string, price: number) => boolean>();
    export const cancelListing = packet<(uuid: string) => boolean>();
    export const buyListing = packet<(uuid: string) => boolean>();
    export const searchListings = packet<(query: string, page: DataType.i32) => MarketplaceListing[]>();
    export const empireActiveListings = property<Map<string, DataType.Packed<MarketplaceListing>>>(new Map());

    // world
    export const triggerProximityPrompt = packet<(path: string) => void>();
    export const damaged = packet<(damage: "Normal" | "DoubleDamage" | "HighDamage" | "Instakill") => void>();
    export const loadCharacter = packet<() => boolean>();

    // pillar puzzle
    export const pillarPuzzleVisible = property<boolean>(false);
    export const pillarPuzzleSequence = property<number[]>([]);
    export const submitPuzzleAnswer = packet<(answer: number[]) => boolean>();
    export const startPillarPuzzle = packet<(pillarNumber: number) => void>();

    // debug
    export const debugStats = property<DebugStatsPayload>({
        serverTps: 0,
        entityCount: 0,
        playerCount: 0,
        uptimeSeconds: 0,
        jobId: "",
        lastUpdated: 0,
    });
    export const debugPing = packet<() => void>({ isUnreliable: true });
}

export = Packets;
