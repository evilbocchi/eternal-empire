import { getRootPart } from "@antivivi/vrldk";
import { OnInit, Service } from "@flamework/core";
import { Players, RunService, TweenService } from "@rbxts/services";
import { Stage } from "server/Quest";
import ModdingService from "server/services/ModdingService";
import DialogueService from "server/services/npc/DialogueService";
import NPCNavigationService from "server/services/npc/NPCNavigationService";
import ChatHookService from "server/services/permissions/ChatHookService";
import ResetService from "server/services/ResetService";
import RevenueService from "server/services/RevenueService";
import CurrencyService from "server/services/serverdata/CurrencyService";
import DataService from "server/services/serverdata/DataService";
import EventService from "server/services/serverdata/EventService";
import ItemsService from "server/services/serverdata/ItemsService";
import PlaytimeService from "server/services/serverdata/PlaytimeService";
import QuestsService from "server/services/serverdata/QuestsService";
import SetupService from "server/services/serverdata/SetupService";
import UnlockedAreasService from "server/services/serverdata/UnlockedAreasService";
import UpgradeBoardService from "server/services/serverdata/UpgradeBoardService";
import AreaService from "server/services/world/AreaService";
import ItemUtils from "shared/item/ItemUtils";
import Items from "shared/items/Items";
import NPC, { Dialogue, NPCAnimationType } from "shared/NPC";

declare global {
    /**
     * Global type alias for the game's API used by items, challenges, quests, and other related content.
     */
    type GameAPI = APIExposeService['GameAPI'];
}


@Service()
export default class APIExposeService implements OnInit {

    constructor(
        private readonly chatHookService: ChatHookService,
        private readonly areaService: AreaService,
        private readonly dataService: DataService,
        private readonly itemsService: ItemsService,
        private readonly currencyService: CurrencyService,
        private readonly unlockedAreasService: UnlockedAreasService,
        private readonly playtimeService: PlaytimeService,
        private readonly resetService: ResetService,
        private readonly revenueService: RevenueService,
        private readonly setupService: SetupService,
        private readonly eventService: EventService,
        private readonly dialogueService: DialogueService,
        private readonly upgradeBoardService: UpgradeBoardService,
        private readonly npcNavigationService: NPCNavigationService,
        private readonly questsService: QuestsService,
        private readonly moddingService: ModdingService
    ) {

    }

    /**
     * Comprehensive game utilities API exposed to items, challenges, quests, and other related content.
     * 
     * Provides access to all major game services and common operations.
     */
    readonly GameAPI = (() => {
        const t = {
            /** Whether the GameAPI object is ready for use */
            ready: true,
            /** The mutable empire data table */
            empireData: this.dataService.empireData,

            areaService: this.areaService,
            chatHookService: this.chatHookService,
            itemsService: this.itemsService,
            currencyService: this.currencyService,
            unlockedAreasService: this.unlockedAreasService,
            playtimeService: this.playtimeService,
            resetService: this.resetService,
            revenueService: this.revenueService,
            setupService: this.setupService,
            eventService: this.eventService,
            npcNavigationService: this.npcNavigationService,
            upgradeBoardService: this.upgradeBoardService,
            items: Items,

            checkPermLevel: (player: Player, action: PermissionKey) => this.dataService.checkPermLevel(player, action),
            dialogueFinished: this.dialogueService.dialogueFinished,
            playNPCAnimation: (npc: NPC, animType: NPCAnimationType) => this.dialogueService.playAnimation(npc, animType),
            stopNPCAnimation: (npc: NPC, animType: NPCAnimationType) => this.dialogueService.stopAnimation(npc, animType),
            onStageReached: (stage: Stage, callback: () => void) => {
                return this.questsService.stageReached.connect((s) => {
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
                const cached = this.npcNavigationService.runningPathfinds.get(npcHumanoid);
                if (cached !== undefined)
                    cached.Disconnect();
                npcHumanoid.RootPart!.Anchored = false;
                const tween = TweenService.Create(npcHumanoid.RootPart!, new TweenInfo(1), { CFrame: point });
                let toCall = false;
                this.npcNavigationService.pathfind(npcHumanoid, point.Position, () => {
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
                this.npcNavigationService.runningPathfinds.set(npcHumanoid, connection);
                return connection;
            },
            getDefaultLocation: (npc: NPC) => this.dialogueService.defaultLocationsPerNPC.get(npc),
            giveQuestItem: (itemId: string, amount: number) => {
                this.itemsService.setItemAmount(itemId, this.itemsService.getItemAmount(itemId) + amount);
                this.chatHookService.sendServerMessage(`[+${amount} ${Items.getItem(itemId)?.name}]`, "tag:hidden;color:255,170,255");
            },
            takeQuestItem: (itemId: string, amount: number) => {
                const currentAmount = this.itemsService.getItemAmount(itemId);
                if (currentAmount < amount)
                    return false;
                this.itemsService.setItemAmount(itemId, currentAmount - amount);
                this.chatHookService.sendServerMessage(`[-${amount} ${Items.getItem(itemId)?.name}]`, "tag:hidden;color:255,170,255");
                return true;
            },
        };
        type noChecking = { [k: string]: unknown; };

        for (const [k, v] of pairs(t))
            (ItemUtils.GameAPI as noChecking)[k] = v;

        this.moddingService.gameAPILoaded.fire();

        return t;
    })();

    onInit() {

    }
}