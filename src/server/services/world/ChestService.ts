/**
 * @fileoverview Manages chest spawning, loot pools, and chest interactions.
 *
 * This service provides:
 * - Chest model spawning and initialization in all areas
 * - Loot pool management and random loot selection
 * - Handling chest opening, cooldowns, and rewards
 * - Synchronizing chest state and rewards with clients
 *
 * @since 1.0.0
 */

import { convertToMMSS, simpleInterval, weldModel } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import { TweenService, Workspace } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import LevelService from "server/services/data/LevelService";
import ItemService from "server/services/item/ItemService";
import { ASSETS, getSound, SOUND_EFFECTS_GROUP } from "shared/asset/GameAssets";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Gold from "shared/items/excavation/Gold";
import CorruptedGrass from "shared/items/excavation/harvestable/CorruptedGrass";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import Grass from "shared/items/excavation/harvestable/Grass";
import StaleWood from "shared/items/excavation/harvestable/StaleWood";
import Iron from "shared/items/excavation/Iron";
import Quartz from "shared/items/excavation/Quartz";
import WhiteGem from "shared/items/excavation/WhiteGem";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

declare global {
    type ChestModel = Model & {
        Lid: Model;
        Base: Model;
        Hitbox: BasePart & {
            CooldownGui: CooldownGui;
        };
    };

    type CooldownGui = BillboardGui & {
        CooldownLabel: TextLabel;
    };

    interface Assets {
        Chest: ChestModel;
    }
}

/**
 * Represents a possible loot drop from a chest.
 * Can be an item, a harvestable, or XP.
 */
interface Loot {
    /**
     * The item that was dropped.
     */
    itemId?: string;

    /**
     * The harvestable ID that was dropped.
     */
    harvestable?: HarvestableId;

    /**
     * The amount that was dropped.
     */
    xp?: number;
}

/**
 * LootPool manages weighted random selection of loot for chests.
 * Supports adding items, harvestables, and XP with weights.
 */
class LootPool {
    /** Static random instance for consistent pulls. */
    static readonly RANDOM = new Random(tick());

    /** Map of loot objects to their weights. */
    pool = new Map<Loot, number>();

    /**
     * Adds an item to the loot pool with a given weight.
     *
     * @param item The item to add.
     * @param weight The weight for random selection.
     */
    addItem(item: Item, weight: number) {
        this.pool.set({ itemId: item.id }, weight);
        return this;
    }

    /**
     * Adds a harvestable to the loot pool with a given weight.
     *
     * @param harvestable The harvestable ID.
     * @param weight The weight for random selection.
     */
    addHarvestable(harvestable: HarvestableId, weight: number) {
        this.pool.set({ harvestable: harvestable }, weight);
        return this;
    }

    /**
     * Adds XP to the loot pool with a given weight.
     *
     * @param xp The XP amount.
     * @param weight The weight for random selection.
     */
    addXP(xp: number, weight: number) {
        this.pool.set({ xp: xp }, weight);
        return this;
    }

    /**
     * Calculates the total weight of all loot in the pool.
     */
    getTotalWeight() {
        let totalWeight = 0;
        for (const [_piece, weight] of this.pool) {
            totalWeight += weight;
        }
        return totalWeight;
    }

    /**
     * Pulls a number of loot items from the pool using weighted random selection.
     *
     * @param amount The number of loot items to pull (default 5).
     * @returns An array of selected loot objects.
     */
    pull(amount = 5) {
        // Selects a loot item based on weights.
        const totalWeight = this.getTotalWeight();
        const get = () => {
            // Generate a random number between 1 and totalWeight.
            const chance = LootPool.RANDOM.NextInteger(1, totalWeight);
            let counter = 0;
            for (const [piece, weight] of this.pool) {
                counter += weight;
                // If the random number falls within this weight, select this loot.
                if (chance < counter) {
                    return piece;
                }
            }
        };
        // Pull the requested number of loot items.
        const loot = new Array<Loot>();
        for (let i = 0; i < amount; i++) {
            const got = get();
            if (got !== undefined) loot.push(got);
        }
        return loot;
    }
}

/**
 * Service that manages chest spawning, loot, and interactions.
 */
@Service()
export default class ChestService implements OnInit, OnStart {
    /** Loot pools per chest level. */
    poolPerLevel = new Map<string, LootPool>();

    /** Chest cooldown in seconds. */
    cooldown = 900;

    /** Map of chest locations to chest models. */
    chestPerChestLocation = new Map<Vector3, ChestModel>();

    /** Tween info for chest lid animation. */
    openTweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

    constructor(
        private dataService: DataService,
        private levelService: LevelService,
        private itemService: ItemService,
    ) {}

    /**
     * Rounds a Vector3 to integer values.
     * @param vector3 The vector to round.
     */
    round(vector3: Vector3) {
        return new Vector3(math.round(vector3.X), math.round(vector3.Y), math.round(vector3.Z));
    }

    /**
     * Marks the last open time for a chest and updates its state.
     *
     * @param chestLocation The chest's location.
     * @param lastOpen The last open timestamp.
     */
    markLastOpen(chestLocation: Vector3, lastOpen: number) {
        const chest = this.chestPerChestLocation.get(chestLocation);
        if (chest === undefined) return false;
        const bindableEvent = chest.FindFirstChild("MarkLastOpen") as BindableEvent;
        if (bindableEvent === undefined) throw `Chest at ${chestLocation} does not have a MarkLastOpen BindableEvent`;
        bindableEvent.Fire(lastOpen);
        return true;
    }

    /**
     * Rewards loot to the player, updating items and XP.
     *
     * @param loots The loot objects to reward.
     */
    rewardLoot(...loots: Loot[]) {
        let totalXp = 0;
        const items = new Map<string, number>();
        const addItem = (item: Item) => {
            const itemId = item.id;
            this.itemService.giveItem(itemId, 1);
            items.set(itemId, (items.get(itemId) ?? 0) + 1);
        };
        for (const loot of loots) {
            if (loot.xp !== undefined) totalXp += loot.xp;
            if (loot.itemId !== undefined) addItem(Items.getItem(loot.itemId)!);
            if (loot.harvestable !== undefined) addItem(Items.getItem(loot.harvestable)!);
        }
        const current = this.levelService.getXp();
        const serialized = new Array<LootInfo>();

        if (totalXp > 0) {
            this.levelService.setXp(current + totalXp);
            serialized.push({ id: "xp", amount: totalXp });
        }
        for (const [id, amount] of items) {
            serialized.push({ id, amount });
        }

        Packets.showLoot.toAllClients(serialized);
    }

    /**
     * Opens a chest by ID and rewards loot.
     * @param chestId The chest ID.
     * @param amount The amount of loot to pull.
     */
    openChest(chestId: string, amount: number) {
        const pool = this.poolPerLevel.get(chestId);
        if (pool === undefined) throw `No loot pool found for chest ${chestId}`;
        this.rewardLoot(...pool.pull(amount));
    }

    /**
     * Initializes loot pools for each chest level.
     */
    onInit() {
        this.poolPerLevel.set(
            "1",
            new LootPool()
                .addXP(1, 2000)
                .addXP(3, 1000)
                .addXP(5, 500)
                .addItem(Grass, 1000)
                .addItem(StaleWood, 1000)
                .addItem(ExcavationStone, 1000)
                .addItem(WhiteGem, 200)
                .addItem(EnchantedGrass, 100)
                .addHarvestable("MagicalWood", 50)
                .addItem(Crystal, 50)
                .addItem(Iron, 10)
                .addItem(Gold, 1),
        );
        this.poolPerLevel.set(
            "2",
            new LootPool()
                .addXP(1, 500)
                .addXP(3, 1500)
                .addXP(5, 1000)
                .addXP(9, 500)
                .addItem(Grass, 600)
                .addItem(StaleWood, 600)
                .addItem(ExcavationStone, 600)
                .addItem(WhiteGem, 400)
                .addItem(EnchantedGrass, 200)
                .addHarvestable("MagicalWood", 150)
                .addItem(Crystal, 150)
                .addItem(Iron, 70)
                .addItem(Gold, 30)
                .addItem(Quartz, 1),
        );
        this.poolPerLevel.set(
            "3",
            new LootPool()
                .addXP(4, 500)
                .addXP(6, 1500)
                .addXP(9, 1000)
                .addXP(15, 500)
                .addItem(WhiteGem, 400)
                .addItem(EnchantedGrass, 200)
                .addItem(CorruptedGrass, 2)
                .addItem(Crystal, 200)
                .addItem(Iron, 70)
                .addItem(Gold, 30)
                .addItem(Quartz, 2),
        );
    }

    /**
     * Spawns chests in all areas, sets up chest logic, and restores previous state.
     */
    onStart() {
        const createdChests = new Set<Model>();
        const cleanups = new Array<() => void>();
        for (const [_id, area] of pairs(AREAS)) {
            const chestsFolder = area.worldNode.getInstance()?.FindFirstChild("Chests");
            if (chestsFolder === undefined) continue;
            const chestLocations = chestsFolder.GetChildren();
            for (const chestLocationMarker of chestLocations) {
                if (!chestLocationMarker.IsA("BasePart")) continue;
                if (!IS_EDIT) {
                    chestLocationMarker.FrontSurface = Enum.SurfaceType.Smooth;
                    chestLocationMarker.Transparency = 1;
                }
                const chestModel = ASSETS.Chest.Clone();
                chestModel.PivotTo(chestLocationMarker.CFrame);
                const sound = getSound("ChestOpen.mp3").Clone();
                sound.SoundGroup = SOUND_EFFECTS_GROUP;
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
                    TweenService.Create(bp, this.openTweenInfo, {
                        CFrame: isOpened ? originalLidPivot.mul(CFrame.Angles(-1, 0, 0)) : originalLidPivot,
                    }).Play();
                    prompt.Enabled = !isOpened;
                    chestModel.Hitbox.CooldownGui.Enabled = isOpened;
                };
                const cleanup = simpleInterval(() => {
                    const elapsed = tick() - lastOpen;
                    if (elapsed > this.cooldown && isOpened === true) {
                        isOpened = false;
                        markLastOpen(lastOpen);
                    }
                    if (isOpened) {
                        chestModel.Hitbox.CooldownGui.CooldownLabel.Text = convertToMMSS(
                            math.floor(this.cooldown - elapsed),
                        );
                    }
                }, 1);
                const bindableEvent = new Instance("BindableEvent");
                bindableEvent.Name = "MarkLastOpen";
                const eventConnection = bindableEvent.Event.Connect((lastOpen: number) => markLastOpen(lastOpen));
                bindableEvent.Parent = chestModel;
                const chestLocation = this.round(chestLocationMarker.Position);
                this.chestPerChestLocation.set(chestLocation, chestModel);
                const triggerConnection = prompt.Triggered.Connect(() => {
                    if (!prompt.Enabled) return;
                    if (this.dataService.empireData.unlockedAreas.has(area.name as AreaId)) return;
                    sound.Play();
                    const t = tick();
                    const amount = lastOpen === 0 ? math.random(10, 14) : math.random(3, 7);
                    this.dataService.empireData.openedChests.set(
                        `${chestLocation.X}_${chestLocation.Y}_${chestLocation.Z}`,
                        t,
                    );
                    markLastOpen(t);
                    task.delay(0.25, () => {
                        this.openChest(chestLocationMarker.Name, amount);
                    });
                });
                cleanups.push(() => {
                    cleanup();
                    eventConnection.Disconnect();
                    triggerConnection.Disconnect();
                });
                prompt.Parent = chestModel.PrimaryPart;
                chestModel.Parent = Workspace;
                createdChests.add(chestModel);
            }
        }
        eat(() => {
            for (const chest of createdChests) {
                chest.Destroy();
            }
            for (const cleanup of cleanups) {
                cleanup();
            }
            createdChests.clear();
        });

        const lastOpenPerLocation = this.dataService.empireData.openedChests;
        for (const [location, lastOpen] of lastOpenPerLocation) {
            const [xString, yString, zString] = location.split("_");
            if (
                this.markLastOpen(new Vector3(tonumber(xString), tonumber(yString), tonumber(zString)), lastOpen) ===
                false
            ) {
                lastOpenPerLocation.delete(location);
            }
        }
    }
}
