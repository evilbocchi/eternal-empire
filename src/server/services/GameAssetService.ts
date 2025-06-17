//!optimize 2
//!native

import Signal from "@antivivi/lemon-signal";
import { getInstanceInfo, getRootPart, playSoundAtPart } from "@antivivi/vrldk";
import { OnInit, OnPhysics, OnStart, Service } from "@flamework/core";
import { AnalyticsService, MarketplaceService, PathfindingService, PhysicsService, Players, ProximityPromptService, ReplicatedStorage, RunService, TweenService, Workspace } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
import { DarkMatterService } from "server/services/DarkMatterService";
import { DialogueService } from "server/services/npc/DialogueService";
import { ResetService } from "server/services/ResetService";
import { RevenueService } from "server/services/RevenueService";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { EventService } from "server/services/serverdata/EventService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import { LevelService } from "server/services/serverdata/LevelService";
import { PlaytimeService } from "server/services/serverdata/PlaytimeService";
import { QuestsService } from "server/services/serverdata/QuestsService";
import { SetupService } from "server/services/serverdata/SetupService";
import { UnlockedAreasService } from "server/services/serverdata/UnlockedAreasService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import { getNPCPosition, getWaypoint, PLACED_ITEMS_FOLDER } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { getSound } from "shared/GameAssets";
import GameSpeed from "shared/GameSpeed";
import InteractableObject from "shared/InteractableObject";
import ItemUtils from "shared/item/ItemUtils";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import NPC, { Dialogue, NPCAnimationType } from "shared/NPC";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

declare global {
    type ProductFunction = (receiptInfo: ReceiptInfo, player: Player) => Enum.ProductPurchaseDecision;
    type GameUtils = GameAssetService['GameUtils'];
}

// load the collision groups before anything else
PhysicsService.RegisterCollisionGroup("Decoration");
PhysicsService.RegisterCollisionGroup("ItemHitbox");
PhysicsService.RegisterCollisionGroup("Item");
PhysicsService.RegisterCollisionGroup("QueryableGhost");
PhysicsService.RegisterCollisionGroup("Antighost");
PhysicsService.RegisterCollisionGroup("Droplet");
PhysicsService.RegisterCollisionGroup("Player");
PhysicsService.RegisterCollisionGroup("PlayerHitbox");
PhysicsService.RegisterCollisionGroup("NPC");

PhysicsService.CollisionGroupSetCollidable("Droplet", "Default", false);
PhysicsService.CollisionGroupSetCollidable("Droplet", "Droplet", false);
PhysicsService.CollisionGroupSetCollidable("Droplet", "QueryableGhost", false);
PhysicsService.CollisionGroupSetCollidable("Droplet", "Decoration", false);
PhysicsService.CollisionGroupSetCollidable("Droplet", "Item", true);

PhysicsService.CollisionGroupSetCollidable("ItemHitbox", "Droplet", false);
PhysicsService.CollisionGroupSetCollidable("ItemHitbox", "Item", false);

for (const group of PhysicsService.GetRegisteredCollisionGroups()) {
    PhysicsService.CollisionGroupSetCollidable("QueryableGhost", group.name, group.name === "QueryableGhost");
    PhysicsService.CollisionGroupSetCollidable("Antighost", group.name, group.name === "Droplet");

    PhysicsService.CollisionGroupSetCollidable("NPC", group.name, group.name === "Default");
}

const FURNACE_UPGRADES = NamedUpgrades.getUpgrades("Furnace");
const ONES = CurrencyBundle.ones();

let oldSpeed = 1;

@Service()
export class GameAssetService implements OnInit, OnStart, OnPhysics {

    stageReached = new Signal<(stage: Stage) => void>();
    questItemGiven = new Signal<(itemId: string, amount: number) => void>();
    questItemTaken = new Signal<(itemId: string, amount: number) => void>();

    loadedStages = new Set<Stage>();
    productFunctions = new Map<number, ProductFunction>();
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
            playtimeService: this.playtimeService,
            resetService: this.resetService,
            revenueService: this.revenueService,
            setupService: this.setupService,
            eventService: this.eventService,
            gameAssetService: this,
            items: Items,

            dropletCountPerArea: new Map<AreaId, number>(),

            buyUpgrade: (upgradeId: string, to?: number, player?: Player, isFree?: boolean) => this.upgradeBoardService.buyUpgrade(upgradeId, to, player, isFree),
            checkPermLevel: (player: Player, action: PermissionKey) => this.dataService.checkPermLevel(player, action),
            dialogueFinished: this.dialogueService.dialogueFinished,
            playNPCAnimation: (npc: NPC, animType: NPCAnimationType) => this.dialogueService.playAnimation(npc, animType),
            stopNPCAnimation: (npc: NPC, animType: NPCAnimationType) => this.dialogueService.stopAnimation(npc, animType),
            onStageReached: (stage: Stage, callback: () => void) => {
                return this.stageReached.connect((s) => {
                    if (stage === s) {
                        callback();
                    }
                });
            },
            addDialogue: (dialogue: Dialogue, priority?: number) => this.dialogueService.addDialogue(dialogue.npc, dialogue, priority),
            removeDialogue: (dialogue: Dialogue) => this.dialogueService.removeDialogue(dialogue.npc, dialogue),
            talk: (dialogue: Dialogue, requireInteraction?: boolean) => this.dialogueService.talk(dialogue, requireInteraction),
            addCompletionListener: (event: string, callback: (isCompleted: boolean) => void) => {
                return this.eventService.addCompletionListener(event, callback);
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
                let toCall = false;
                this.pathfind(npcHumanoid, point.Position, () => {
                    tween.Play();
                    if (requiresPlayer === false) {
                        toCall = true;
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
                            toCall = true;
                            connection.Disconnect();
                            return;
                        }
                    }
                });
                task.spawn(() => {
                    while (!toCall) {
                        RunService.Heartbeat.Wait();
                    }
                    print("Reached point", npcHumanoid.Name, point.Position);
                    if (callback !== undefined) {
                        callback();
                    }
                });
                this.runningPathfinds.set(npcHumanoid, connection);
                return connection;
            },
            getDefaultLocation: (npc: NPC) => this.dialogueService.defaultLocationsPerNPC.get(npc),
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
        private dialogueService: DialogueService, private eventService: EventService, private setupService: SetupService, private resetService: ResetService,
        private playtimeService: PlaytimeService) {

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
                }
                newPos = nextWaypoint.Position;
                humanoid.MoveTo(newPos);
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
            const dist = rootPart.Position.sub(newPos).mul(new Vector3(1, 0, 1)).Magnitude;
            if (dist < humanoid.WalkSpeed * 0.1875) { // allow more leeway for higher speeds
                t = 0;
                newPos = undefined;
                doNextWaypoint();
            }
            else if (t > 0.35 * dist) {
                t = 0;
                rootPart.CFrame = new CFrame(newPos);
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

    onQuestComplete(quest: Quest) {
        const completionDialogue = quest.completionDialogue;
        if (completionDialogue !== undefined && completionDialogue.npc !== undefined) {
            this.dialogueService.addDialogue(completionDialogue.npc, completionDialogue);
        }
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
                    const reached = new Set<Stage>();
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
                                    const nextStage = quest.stages[newStage];
                                    this.stageReached.fire(nextStage);
                                    reached.add(nextStage);
                                }
                                this.loadedStages.delete(stage);
                                connection.disconnect();
                            });
                        }
                    }
                    if (current === index && !reached.has(stage)) {
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

    onPhysics() {
        if (GameSpeed.speed !== oldSpeed) {
            oldSpeed = GameSpeed.speed;
            Workspace.Gravity = 196.2 * oldSpeed;
            print("Changed gravity");

            for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
                getInstanceInfo(model, "UpdateSpeed")?.();
            }
        }
    }

    onInit() {
        ProximityPromptService.PromptTriggered.Connect((prompt, player) => {
            if (this.dialogueService.isInteractionEnabled === false || prompt.Parent === undefined)
                return;
            const interactableObject = InteractableObject.REGISTRY.get(prompt.Parent.Name);
            if (interactableObject === undefined)
                return;
            this.dialogueService.proximityPrompts.add(prompt);
            interactableObject.interacted.fire(this.GameUtils, player);
        });

        if (!Sandbox.getEnabled()) {
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
                    questInfo.stages.push({ description: stage.description! });
                });
                questInfos.set(questId, questInfo);
            });
            Packets.questInfo.set(questInfos);

            this.loadAvailableQuests();
            this.levelService.levelChanged.connect(() => this.loadAvailableQuests());
        }

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
        if (Sandbox.getEnabled())
            return;

        const path = PathfindingService.CreatePath();
        path.ComputeAsync(getNPCPosition("Freddy")!, getWaypoint("AHelpingHand2").Position); // load it
        if (path.GetWaypoints().isEmpty()) {
            warn("Pathfinding is not working.");
        }
    }
}