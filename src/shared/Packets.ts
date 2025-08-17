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
        description: string
    }

    type PlacingInfo = {
        id: string,
        position: Vector3,
        rotation: DataType.u16
    }
}

namespace Packets {

    // data management

    /**
     * Fired when the server completed saving empire data.
     * @param status 100 for continue, 200 for success, 500 for failure.
     */
    export const savingEmpire = signal<(status: DataType.u16) => void>();

    /**
     * The empires that are available to the player.
     */
    export const availableEmpires = property<Map<string, EmpireInfo>>(new Map<string, EmpireInfo>());

    /**
     * Request the server to create a new empire.
     * @returns `true` if the request was successful, `false` otherwise.
     */
    export const createNewEmpire = request<() => boolean>();

    /**
     * Request the server to enter a specific empire through Roblox's teleport service.
     * @param empireId The ID of the empire to teleport to.
     * @returns `true` if the request was successful, `false` otherwise.
     */
    export const teleportToEmpire = request<(empireId: string) => boolean>();

    /**
     * Request the server to *prompt* a rename the current empire.
     * This does not immediately rename the empire if method is "robux".
     * 
     * @param name The new name for the empire.
     * @param method The method of renaming, either "robux" or "funds".
     * @returns `true` if the request was successful, `false` otherwise.
     */
    export const promptRename = request<(name: string, method: string) => boolean>();

    /**
     * The cost of renaming the empire in Funds.
     */
    export const renameCost = property<BaseOnoeNum>();

    /**
     * The name of the current empire.
     */
    export const empireName = property<string>();

    // items
    /**
     * The inventory of the empire, containing owned items and their quantities.
     * Some items may not be present in the inventory if they are not owned.
     */
    export const inventory = property<DataType.Packed<Inventory>>();
    export const bought = property<DataType.Packed<Inventory>>();
    export const placedItems = property<Map<string, DataType.Packed<PlacedItem>>>();
    export const buyItem = request<(itemId: string) => boolean>();
    export const buyAllItems = request<(itemIds: string[]) => boolean>();
    export const placeItems = request<(items: PlacingInfo[]) => number>();
    export const uniqueInstances = property<Map<string, DataType.Packed<UniqueItemInstance>>>();
    
    export const unplaceItems = signal<(placementIds: string[]) => void>();
    export const boostChanged = signal<(boostPerItem: Map<string, BaseOnoeNum>) => void>(true);

    // droplets
    export const dropletAdded = signal<(drop: BasePart) => void>(true);
    export const dropletBurnt = signal<(dropletModelId: string, amountPerCurrency: Map<Currency, BaseOnoeNum>) => void>(true);
    export const applyImpulse = signal<(dropletModelId: string, impulse: Vector3) => void>(true);

    // weather
    export const weatherChanged = signal<(weatherState: object) => void>();
    export const getWeatherState = request<() => object>();

    // currencies
    export const balance = property<Map<Currency, BaseOnoeNum>>(new Map(), true);
    export const mostBalance = property<Map<Currency, BaseOnoeNum>>(new Map(), true);
    export const revenue = property<Map<Currency, BaseOnoeNum>>(new Map(), true);
    export const showDifference = signal<(differencePerCurrency: Map<Currency, BaseOnoeNum>) => void>();

    // upgrade board
    export const upgrades = property<Map<string, DataType.i32>>(new Map());
    export const buyUpgrade = request<(upgradeId: string, to: DataType.i32 | undefined) => boolean>();

    // resets
    export const reset = signal<(layer: ResetLayerId, amount: BaseOnoeNum) => void>();
    export const printedSetups = property<Array<Setup>>();
    export const renameSetup = signal<(currentName: string, renameTo: string) => void>();
    export const autoloadSetup = signal<(name: string) => void>();
    export const startChallenge = signal<(challenge: string) => void>();
    export const quitChallenge = signal<() => void>();
    export const currentChallenge = property<{name: string, r1: DataType.f32, g1: DataType.f32, b1: DataType.f32, r2: DataType.f32, g2: DataType.f32, b2: DataType.f32, description: string}>();
    export const challengeCompleted = signal<(challenge: string, rewardLabel: string) => void>();

    // areas
    export const tpToArea = request<(area: AreaId) => boolean>();
    export const areaUnlocked = signal<(area: AreaId) => void>();
    export const dropletCountChanged = signal<(area: AreaId, current: number) => void>(true);

    // quests
    export const questInfo = property<Map<string, DataType.Packed<QuestInfo>>>();
    export const stagePerQuest = property<Map<string, DataType.i32>>(new Map());
    export const questCompleted = signal<(questId: string) => void>();
    export const level = property<DataType.i32>(-1);
    export const xp = property<DataType.i32>(-1);

    // playtime
    export const longestSessionTime = property<DataType.i32>(0, true);
    export const sessionTime = property<DataType.i32>(0, true);
    export const empirePlaytime = property<DataType.i32>(0, true);
    export const playerPlaytime = property<DataType.i32>(0, true);

    // permissions
    export const permLevels = property<{[key in PermissionKey]?: number}>({});
    export const getLogs = request<() => Log[]>();
    export const systemMessageSent = signal<(channel: string, message: string, metadata: string) => void>();
    export const codeReceived = signal<(code: string) => void>();
    export const tabOpened = signal<(tab: string) => void>();
    export const donationGiven = signal<() => void>();
    export const promptDonation = signal<(donationId: DataType.i32) => void>();
    export const logAdded = signal<(log: Log) => void>();

    // settings
    export const settings = property<DataType.Packed<typeof PlayerProfileTemplate.settings>>();
    export const setSetting = signal<<T extends keyof Settings>(setting: T, value: Settings[T]) => void>();
    export const setHotkey = signal<(name: string, key: DataType.i32) => void>();

    // npcs
    export const nextDialogue = request<() => boolean>();
    export const npcMessage = signal<(message: string, pos: number, end: number, prompt: boolean, npc: Instance) => void>();

    // chests
    export const itemsReceived = signal<(items: Map<string, number>) => void>();
    export const xpReceived = signal<(xp: number) => void>();

    // bombs
    export const useBomb = request<(bombType: Currency) => boolean>();

    // tools
    export const useTool = signal<(harvestable: Instance) => void>(true);

    // visual
    export const camShake = signal<() => void>();

    // admin
    export const modifyGame = signal<(param: string) => void>();
}

export = Packets;