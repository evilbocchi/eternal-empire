/**
 * @fileoverview APIExposeService - Exposes a unified ServerAPI for use by items, challenges, quests, and related content.
 *
 * This service:
 * - Aggregates and exposes core game services and utility functions
 * - Provides a single ServerAPI object for scripting and modding
 * - Integrates with the modding system for API readiness events
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import ModdingService from "server/services/ModdingService";
import DialogueService from "server/services/npc/DialogueService";
import NPCNavigationService from "server/services/npc/NPCNavigationService";
import NPCStateService from "server/services/npc/NPCStateService";
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

declare global {
    /**
     * Global type alias for the game's API used by items, challenges, quests, and other related content.
     */
    type ServerAPI = APIExposeService['ServerAPI'];
}

/**
 * Service that exposes a unified ServerAPI for use by game content and modding.
 */
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
        private readonly npcStateService: NPCStateService,
        private readonly questsService: QuestsService,
        private readonly moddingService: ModdingService
    ) {

    }

    /**
     * Comprehensive game utilities API exposed to items, challenges, quests, and other related content.
     * 
     * Provides access to all major game services and common operations.
     */
    readonly ServerAPI = (() => {
        const t = {

            /** Whether the ServerAPI object is ready for use */
            ready: true,

            /**
             * The mutable empire data table.
             * 
             * @see {@link DataService.loadedInformation} for information on how this is loaded.
             */
            empireData: this.dataService.empireData,

            /**
             * Area management service.
             * 
             * @borrows AreaService as areaService
             * @see {@link AreaService} for more details.
             */
            areaService: this.areaService,

            /**
             * Chat hook service for sending messages and managing channels.
             * 
             * @borrows ChatHookService as chatHookService
             * @see {@link ChatHookService} for more details.
             */
            chatHookService: this.chatHookService,

            /**
             * Currency and balance management service.
             * 
             * @borrows CurrencyService as currencyService
             * @see {@link CurrencyService} for more details.
             */
            currencyService: this.currencyService,

            /**
             * Dialogue service for managing NPC dialogues and interactions.
             * 
             * @borrows DialogueService as dialogueService
             * @see {@link DialogueService} for more details.
             */
            dialogueService: this.dialogueService,

            /**
             * Event tracking and completion service.
             * 
             * @borrows EventService as eventService
             * @see {@link EventService} for more details.
             */
            eventService: this.eventService,

            /**
             * Item inventory and management service.
             * 
             * @borrows ItemsService as itemsService
             * @see {@link ItemsService} for more details.
             */
            itemsService: this.itemsService,

            /**
             * NPC navigation/pathfinding service.
             * 
             * @borrows NPCNavigationService as npcNavigationService
             * @see {@link NPCNavigationService} for more details.
             */
            npcNavigationService: this.npcNavigationService,

            /**
             * NPC state management service.
             * 
             * @borrows NPCStateService as npcStateService
             * @see {@link NPCStateService} for more details.
             */
            npcStateService: this.npcStateService,

            /**
             * Playtime tracking service.
             * 
             * @borrows PlaytimeService as playtimeService
             * @see {@link PlaytimeService} for more details.
             */
            playtimeService: this.playtimeService,

            /**
             * Quest management service.
             * 
             * @borrows QuestsService as questsService
             * @see {@link QuestsService} for more details.
             */
            questsService: this.questsService,

            /**
             * Handles player resets and related logic.
             * 
             * @borrows ResetService as resetService
             * @see {@link ResetService} for more details.
             */
            resetService: this.resetService,

            /**
             * Revenue and purchase tracking service.
             * 
             * @borrows RevenueService as revenueService
             * @see {@link RevenueService} for more details.
             */
            revenueService: this.revenueService,

            /**
             * Setup and configuration management service.
             * 
             * @borrows SetupService as setupService
             * @see {@link SetupService} for more details.
             */
            setupService: this.setupService,

            /**
             * Service for unlocking and tracking areas.
             * 
             * @borrows UnlockedAreasService as unlockedAreasService
             * @see {@link UnlockedAreasService} for more details.
             */
            unlockedAreasService: this.unlockedAreasService,

            /**
             * Upgrade board and upgrade state management.
             * 
             * @borrows UpgradeBoardService as upgradeBoardService
             * @see {@link UpgradeBoardService} for more details.
             */
            upgradeBoardService: this.upgradeBoardService,

            /**
             * Reference to all registered items.
             * 
             * @see {@link Items} for more details.
             */
            items: Items,
        };
        type noChecking = { [k: string]: unknown; };

        for (const [k, v] of pairs(t))
            (ItemUtils.ServerAPI as noChecking)[k] = v;

        this.moddingService.gameAPILoaded.fire();

        return t;
    })();

    onInit() {

    }
}