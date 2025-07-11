//!optimize 2
//!native

import Signal from "@antivivi/lemon-signal";
import { OnInit, OnPhysics, OnStart, Service } from "@flamework/core";
import { AnalyticsService, Lighting, MarketplaceService, PathfindingService, PhysicsService, Players, ProximityPromptService, ReplicatedStorage, RunService, TweenService, Workspace } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
import { DarkMatterService } from "server/services/DarkMatterService";
import { NPCService } from "server/services/NPCService";
import { ResetService } from "server/services/ResetService";
import { RevenueService } from "server/services/RevenueService";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService, EmpireProfileTemplate } from "server/services/serverdata/DataService";
import { EventService } from "server/services/serverdata/EventService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import { LevelService } from "server/services/serverdata/LevelService";
import { QuestsService } from "server/services/serverdata/QuestsService";
import { SetupService } from "server/services/serverdata/SetupService";
import { UnlockedAreasService } from "server/services/serverdata/UnlockedAreasService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import { PLACED_ITEMS_FOLDER, getNPCPosition, getSound, getWaypoint } from "shared/constants";
import GameSpeed from "shared/GameSpeed";
import InteractableObject from "shared/InteractableObject";
import Conveyor from "shared/item/Conveyor";
import Droplet from "shared/item/Droplet";
import Upgrader from "shared/item/Upgrader";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/network/Packets";
import NPC, { Dialogue, NPCAnimationType } from "shared/NPC";
import Price from "shared/Price";
import ItemUtils from "shared/utils/ItemUtils";
import ReserveModels from "shared/utils/ReserveModels";
import { playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";
import { getRootPart } from "shared/utils/vrldk/PlayerUtils";

declare global {
    type ProductFunction = (receiptInfo: ReceiptInfo, player: Player) => Enum.ProductPurchaseDecision;
}

const FURNACE_UPGRADES = NamedUpgrades.getUpgrades("Furnace");

let oldSpeed = 1;

@Service()
export class GameAssetService implements OnInit, OnStart, OnPhysics {

    stageReached = new Signal<(stage: Stage) => void>();
    questItemGiven = new Signal<(itemId: string, amount: number) => void>();
    questItemTaken = new Signal<(itemId: string, amount: number) => void>();

    loadedStages = new Set<Stage>();
    productFunctions = new Map<number, ProductFunction>();
    infoPerInstance = new Map<Instance, InstanceInfo>();
    runningPathfinds = new Map<Humanoid, RBXScriptConnection>();

    isRendering = false;

    readonly GameUtils = (() => {
        const t = {
            /** Whether the GameUtils object is ready for use */
            ready: true,
            /** The mutable empire data table */
            empireData: this.dataService.empireData,
            
            itemsService: this.itemsService,
            currencyService: this.currencyService,
            unlockedAreasService: this.unlockedAreasService,
            resetService: this.resetService,
            revenueService: this.revenueService,
            items: Items,

            calculateDropletValue: (dropletModel: BasePart, includesGlobalBoosts?: boolean, includesUpgrades?: boolean) =>
                this.calculateDropletValue(dropletModel, includesGlobalBoosts, includesUpgrades),
            dropletCountPerArea: new Map<AreaId, number>(),
            
            buyUpgrade: (upgradeId: string, to?: number, player?: Player, isFree?: boolean) => this.upgradeBoardService.buyUpgrade(upgradeId, to, player, isFree),
            checkPermLevel: (player: Player, action: keyof typeof EmpireProfileTemplate.permLevels) => this.dataService.checkPermLevel(player, action),
            saveSetup: (player: Player, area: AreaId, name: string) => this.setupService.saveSetup(player, area, name),
            loadSetup: (player: Player, name: string) => this.setupService.loadSetup(player, name),
            dialogueFinished: this.npcService.dialogueFinished,
            playNPCAnimation: (npc: NPC, animType: NPCAnimationType) => this.npcService.playAnimation(npc, animType),
            stopNPCAnimation: (npc: NPC, animType: NPCAnimationType) => this.npcService.stopAnimation(npc, animType),
            onStageReached: (stage: Stage, callback: () => void) => {
                return this.stageReached.connect((s) => {
                    if (stage === s) {
                        callback();
                    }
                });
            },
            addDialogue: (dialogue: Dialogue, priority?: number) => this.npcService.addDialogue(dialogue.npc, dialogue, priority),
            removeDialogue: (dialogue: Dialogue) => this.npcService.removeDialogue(dialogue.npc, dialogue),
            talk: (dialogue: Dialogue, requireInteraction?: boolean) => this.npcService.talk(dialogue, requireInteraction),
            onEventCompleted: (event: string, callback: (isCompleted: boolean) => void) => {
                if (this.eventService.isEventCompleted(event))
                    callback(true);
                return this.eventService.eventCompleted.connect((e, isCompleted) => {
                    if (event === e)
                        callback(isCompleted);
                });
            },
            isEventCompleted: (event: string) => this.eventService.isEventCompleted(event),
            setEventCompleted: (event: string, isCompleted: boolean) => this.eventService.setEventCompleted(event, isCompleted),
            isQuestCompleted: (questId: string) => this.dataService.empireData.quests.get(questId) === -1,
            leadToPoint: (npcHumanoid: Instance, point: CFrame, callback: () => unknown, requiresPlayer?: boolean, agentParams?: AgentParameters) => {
                if (!npcHumanoid.IsA("Humanoid"))
                    throw npcHumanoid.Name + " is not a Humanoid";
                const cached = this.runningPathfinds.get(npcHumanoid);
                if (cached !== undefined)
                    cached.Disconnect();
                npcHumanoid.RootPart!.Anchored = false;
                const tween = TweenService.Create(npcHumanoid.RootPart!, new TweenInfo(1), { CFrame: point });
                let called = false;
                this.pathfind(npcHumanoid, point.Position, () => {
                    tween.Play();
                    if (requiresPlayer === false && called === false) {
                        callback();
                        called = true;
                    }
                }, agentParams);
                const connection = RunService.Heartbeat.Connect(() => {
                    const players = Players.GetPlayers();
                    for (const player of players) {
                        const playerRootPart = getRootPart(player);
                        if (playerRootPart === undefined)
                            continue;
                        if (point.Position.sub(playerRootPart.Position).Magnitude < 10) {
                            tween.Play();
                            if (called === false)
                                callback();
                            called = true;
                            connection.Disconnect();
                            return;
                        }
                    }
                });
                this.runningPathfinds.set(npcHumanoid, connection);
                return connection;
            },
            getDefaultLocation: (npc: NPC) => this.npcService.defaultLocationsPerNPC.get(npc),
            giveQuestItem: (itemId: string, amount: number) => {
                this.itemsService.setItemAmount(itemId, this.itemsService.getItemAmount(itemId) + amount);
                this.questItemGiven.fire(itemId, amount);
            },
            takeQuestItem: (itemId: string, amount: number) => {
                const currentAmount = this.itemsService.getItemAmount(itemId);
                if (currentAmount < amount)
                    return false;
                this.itemsService.setItemAmount(itemId, currentAmount - amount);
                this.questItemTaken.fire(itemId, amount);
                return true;
            },
            openShop: (itemId: string) => Packets.openShop.fireAll(itemId),
            setInstanceInfo: <T extends keyof InstanceInfo>(instance: Instance, key: T, value: InstanceInfo[T]) => {
                let info = this.infoPerInstance.get(instance);
                if (info === undefined) {
                    info = {};
                    this.infoPerInstance.set(instance, info);
                }
                info[key] = value;
                return info;
            },
            getAllInstanceInfo: (instance: Instance) => {
                let info = this.infoPerInstance.get(instance);
                if (info === undefined) {
                    info = {};
                    this.infoPerInstance.set(instance, info);
                }
                return info;
            },
            getInstanceInfo: <T extends keyof InstanceInfo>(instance: Instance, key: T) => {
                const info = this.infoPerInstance.get(instance);
                if (info === undefined)
                    return undefined;
                return info[key];
            },
            darkMatterBoost: this.darkMatterService.boost
        };
        type noChecking = { [k: string]: unknown; };

        for (const [k, v] of pairs(t))
            (ItemUtils.GameUtils as noChecking)[k] = v;

        return t;
    })();

    readonly PATHFINDING_COSTS = {
        Water: 20,
        SmoothPlastic: 10,
        Wood: 10,
        Plastic: 2
    };
    readonly PATHFINDING_PARAMS = {
        Costs: this.PATHFINDING_COSTS,
        WaypointSpacing: 6
    };

    constructor(private dataService: DataService, private itemsService: ItemsService, private currencyService: CurrencyService,
        private upgradeBoardService: UpgradeBoardService, private questsService: QuestsService, private levelService: LevelService,
        private unlockedAreasService: UnlockedAreasService, private darkMatterService: DarkMatterService, private revenueService: RevenueService,
        private npcService: NPCService, private eventService: EventService, private setupService: SetupService, private resetService: ResetService) {

    }

    pathfind(humanoid: Humanoid, position: Vector3, endCallback: () => unknown, params: AgentParameters = this.PATHFINDING_PARAMS, iterations?: number) {
        if (iterations !== undefined && iterations <= 0) {
            return;
        }
        const rootPart = humanoid.RootPart!;
        params.Costs = this.PATHFINDING_COSTS;
        const path = PathfindingService.CreatePath(params);
        path.ComputeAsync(rootPart.Position, position);
        const waypoints = path.GetWaypoints();
        let i = 0;
        let newPos: Vector3 | undefined;
        const doNextWaypoint = () => {
            ++i;
            const nextWaypoint = waypoints[i];
            if (nextWaypoint !== undefined) {
                if (nextWaypoint.Action === Enum.PathWaypointAction.Jump) {
                    humanoid.Jump = true;
                    playSoundAtPart(rootPart, getSound("Jump"));
                    doNextWaypoint();
                }
                else if (nextWaypoint.Action === Enum.PathWaypointAction.Walk) {
                    newPos = nextWaypoint.Position;
                    humanoid.MoveTo(newPos);
                }
            }
            else {
                connection.Disconnect();
                endCallback();
            }
        };
        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            if (newPos === undefined)
                return;
            t += dt;
            if (rootPart.Position.sub(newPos).mul(new Vector3(1, 0, 1)).Magnitude < 3) {
                t = 0;
                newPos = undefined;
                doNextWaypoint();
            }
            else if (t > 2) {
                t = 0;
                connection.Disconnect();
                return this.pathfind(humanoid, position, endCallback);
            }
        });
        if (waypoints.isEmpty()) {
            warn("No path found");
            this.pathfind(humanoid, position.add(new Vector3(0, 1, 0)), endCallback, params, iterations === undefined ? 2 : iterations - 1);
            return;
        }
        doNextWaypoint();
        return connection;
    }

    /**
     * Gives the total value of the specified droplet.
     * Accounts for all boosts.
     * 
     * @param dropletModel Droplet to calculate
     * @param includesGlobalBoosts Whether to include global boosts e.g. Dark Matter, Funds bombs. This is useful for {@link Condenser}
     * @param includesUpgrades Whether to include upgrades introduced by {@link Upgrader} items
     * @returns Value of droplet with some meta info
     */
    calculateDropletValue(dropletModel: BasePart, includesGlobalBoosts = true, includesUpgrades = true) {
        const instanceInfo = this.infoPerInstance.get(dropletModel)!;
        const droplet = Droplet.getDroplet(instanceInfo.DropletId!) as Droplet;
        let totalAdd = Price.EMPTY_PRICE;
        let totalMul = Price.ONES;
        let totalPow = Price.ONES;
        let additional = 1;
        if (instanceInfo.Sky === true && includesUpgrades === false) {
            includesUpgrades = true;
            additional /= 250; // nerf applied to sky droplets
        }

        if (instanceInfo.Upgrades !== undefined && includesUpgrades === true) {
            for (const [_id, upgradeInfo] of instanceInfo.Upgrades) {
                const [add, mul, pow] = this.revenueService.getUpgrade(upgradeInfo);
                if (add !== undefined)
                    totalAdd = totalAdd.add(add);
                if (mul !== undefined)
                    totalMul = totalMul.mul(mul);
                if (pow !== undefined)
                    totalPow = totalPow.pow(pow);
            }
        }

        if (includesGlobalBoosts === true) {
            [totalAdd, totalMul, totalPow] = this.revenueService.applyGlobal(totalAdd, totalMul, totalPow, FURNACE_UPGRADES);
        }
        
        let worth = this.revenueService.coalesce(droplet.value, totalAdd, totalMul, totalPow);
        if (includesGlobalBoosts === true) {
            this.revenueService.applySoftcaps(worth.costPerCurrency);
        }

        // hp is a stat that always has highest priority
        additional *= math.min(100, instanceInfo.Health!) / 100;

        worth = worth.mul(additional);
        return $tuple(worth, additional);
    }

    onQuestComplete(quest: Quest) {
        const completionDialogue = quest.completionDialogue;
        if (completionDialogue !== undefined && completionDialogue.npc !== undefined)
            this.npcService.addDialogue(completionDialogue.npc, completionDialogue);
    }

    loadAvailableQuests(level?: number) {
        if (level === undefined) {
            level = this.dataService.empireData.level;
        }
        const stagePerQuest = this.dataService.empireData.quests;
        if (stagePerQuest === undefined) {
            return;
        }
        for (const [id, quest] of Quest.init()) {
            if (quest.level > level) {
                continue;
            }
            const current = stagePerQuest.get(id) ?? 0;
            quest.loaded = true;
            quest.stages.forEach((stage, index) => {
                task.spawn(() => {
                    // loading
                    if (!this.loadedStages.has(stage)) {
                        const load = stage.load;
                        if (load !== undefined) {
                            this.loadedStages.add(stage);
                            const rem = load(stage);
                            const connection = stage.completed.connect(() => {
                                const newStage = this.questsService.completeStage(quest, index);
                                if (newStage === undefined) {
                                    return;
                                }
                                rem();
                                print(`Completed stage ${index} in ${quest.id}, now in stage ${newStage}`);
                                const player = Players.GetPlayers()[0];
                                if (player !== undefined)
                                    AnalyticsService.LogOnboardingFunnelStepEvent(player, index + 1, "Quest " + quest.name);
                                if (newStage === -1) {
                                    this.completeQuest(quest);
                                }
                                else {
                                    this.stageReached.fire(quest.stages[newStage]);
                                }
                                this.loadedStages.delete(stage);
                                connection.disconnect();
                            });
                        }
                    }
                    if (current === index) {
                        this.stageReached.fire(stage);
                    }
                });
            });
            if (current === -1) {
                this.onQuestComplete(quest);
            }
        }
    }

    completeQuest(quest: Quest) {
        Packets.questCompleted.fireAll(quest.id);
        const reward = quest.reward;
        if (reward.xp !== undefined) {
            const originalXp = this.levelService.getXp();
            if (originalXp === undefined) {
                warn("No original xp, not rewarding");
            }
            else {
                this.levelService.setXp(originalXp + reward.xp);
            }
        }
        if (reward.items !== undefined) {
            for (const [item, amount] of reward.items) {
                this.itemsService.setItemAmount(item, this.itemsService.getItemAmount(item) + amount);
            }
        }
        this.onQuestComplete(quest);
    }

    setProductFunction(productID: number, productFunction: ProductFunction) {
        this.productFunctions.set(productID, productFunction);
    }

    onPhysics(dt: number) {
        Lighting.ClockTime += dt * 0.02;
        if (GameSpeed.speed !== oldSpeed) {
            oldSpeed = GameSpeed.speed;
            Workspace.Gravity = 196.2 * oldSpeed;
            print("Changed gravity");

            for (const placedItem of this.dataService.empireData.items.placed) {
                const item = Items.getItem(placedItem.item)!;
                if (!item.isA("Conveyor"))
                    continue;
                const model = PLACED_ITEMS_FOLDER.FindFirstChild(placedItem.placementId);
                if (model === undefined)
                    continue;
                Conveyor.load(model as Model, item);
            }
        }
    }

    onInit() {
        ProximityPromptService.PromptTriggered.Connect((prompt, player) => {
            if (this.npcService.isInteractionEnabled === false || prompt.Parent === undefined)
                return;
            const interactableObject = InteractableObject.REGISTRY.get(prompt.Parent.Name);
            if (interactableObject === undefined)
                return;
            this.npcService.proximityPrompts.add(prompt);
            interactableObject.interacted.fire(this.GameUtils, player);
        });

        PhysicsService.RegisterCollisionGroup("ItemHitbox");
        PhysicsService.RegisterCollisionGroup("Item");
        PhysicsService.RegisterCollisionGroup("Droplet");
        PhysicsService.RegisterCollisionGroup("Player");
        PhysicsService.RegisterCollisionGroup("PlayerHitbox");
        PhysicsService.RegisterCollisionGroup("NPC");
        PhysicsService.CollisionGroupSetCollidable("Droplet", "Droplet", false);
        PhysicsService.CollisionGroupSetCollidable("NPC", "ItemHitbox", false);
        PhysicsService.CollisionGroupSetCollidable("NPC", "Item", false);
        PhysicsService.CollisionGroupSetCollidable("NPC", "Player", false);
        PhysicsService.CollisionGroupSetCollidable("NPC", "NPC", false);

        const particlesEnabled = this.dataService.empireData.particlesEnabled === true;
        for (const [particle, toggled] of ReserveModels.particles) {
            particle.Enabled = toggled && particlesEnabled;
        }

        let itemCount = 0;
        
        Items.itemsPerId.forEach((item) => {
            item.INITALIZES.forEach((callback) => callback(item));
            ++itemCount;
        });
        ItemUtils.formulaResultsChanged.connect((val) => Packets.boostChanged.fireAll(val));
        print("Loaded " + itemCount + " items");
        const questInfos = new Map<string, QuestInfo>();

        Quest.init().forEach((quest, questId) => {
            quest.initialized.fire();

            const questInfo: QuestInfo = {
                name: quest.name ?? questId,
                colorR: quest.color.R,
                colorG: quest.color.G,
                colorB: quest.color.B,
                level: quest.level,
                length: quest.length,
                reward: quest.reward,
                order: quest.order,
                stages: new Array()
            };
            quest.stages.forEach((stage, index) => {
                const onPositionChanged = (position?: Vector3) => ReplicatedStorage.SetAttribute(`${questId}${index}`, position);
                onPositionChanged(stage.position);
                stage.positionChanged.connect((position) => onPositionChanged(position));
                questInfo.stages.push({ description: stage.description!, npcHumanoid: stage.npcHumanoid });
            });
            questInfos.set(questId, questInfo);
        });
        Packets.questInfo.set(questInfos);
        this.loadAvailableQuests();
        this.levelService.levelChanged.connect(() => this.loadAvailableQuests());

        MarketplaceService.ProcessReceipt = (receiptInfo: ReceiptInfo) => {
            const productFunction = this.productFunctions.get(receiptInfo.ProductId);
            const player = Players.GetPlayerByUserId(receiptInfo.PlayerId);
            if (productFunction === undefined || player === undefined) {
                print(receiptInfo);
                return Enum.ProductPurchaseDecision.NotProcessedYet;
            }
            return productFunction(receiptInfo, player);
        };
    }

    onStart() {
        Packets.printedSetups.set(this.dataService.empireData.printedSetups);

        const path = PathfindingService.CreatePath();
        path.ComputeAsync(getNPCPosition("Freddy")!, getWaypoint("AHelpingHand2").Position); // load it
        if (path.GetWaypoints().isEmpty()) {
            warn("Pathfinding is not working.");
        }
    }
}