/**
 * @fileoverview Exposes a unified Server for use by items, challenges, quests, and related content.
 *
 * This service:
 * - Aggregates and exposes core game services and utility functions
 * - Provides a single Server object for scripting and modding
 * - Integrates with the modding system for API readiness events
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import EventService from "server/services/data/EventService";
import LevelService from "server/services/data/LevelService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import PlaytimeService from "server/services/data/PlaytimeService";
import QuestService from "server/services/data/QuestService";
import SetupService from "server/services/data/SetupService";
import { DonationService } from "server/services/DonationService";
import ItemService from "server/services/item/ItemService";
import { LeaderboardService } from "server/services/leaderboard/LeaderboardService";
import MarketplaceService from "server/services/marketplace/MarketplaceService";
import ModdingService from "server/services/ModdingService";
import DialogueService from "server/services/npc/DialogueService";
import NPCNavigationService from "server/services/npc/NPCNavigationService";
import NPCStateService from "server/services/npc/NPCStateService";
import ChatHookService from "server/services/permissions/ChatHookService";
import PermissionsService from "server/services/permissions/PermissionsService";
import ResetService from "server/services/ResetService";
import RevenueService from "server/services/RevenueService";
import AreaService from "server/services/world/AreaService";
import AtmosphereService from "server/services/world/AtmosphereService";
import ChestService from "server/services/world/ChestService";
import UnlockedAreasService from "server/services/world/UnlockedAreasService";
import ItemUtils from "shared/item/ItemUtils";
import Items from "shared/items/Items";

declare global {
    /**
     * Global type alias for the game's API used by items, challenges, quests, and other related content.
     */
    type Server = APIExposeService["Server"];
}

/**
 * Service that exposes a unified Server for use by game content and modding.
 */
@Service()
export default class APIExposeService implements OnInit {
    constructor(
        private readonly areaService: AreaService,
        private readonly atmosphereService: AtmosphereService,
        private readonly chatHookService: ChatHookService,
        private readonly chestService: ChestService,
        private readonly currencyService: CurrencyService,
        private readonly dataService: DataService,
        private readonly dialogueService: DialogueService,
        private readonly donationService: DonationService,
        private readonly eventService: EventService,
        private readonly itemService: ItemService,
        private readonly levelService: LevelService,
        private readonly leaderboardService: LeaderboardService,
        private readonly moddingService: ModdingService,
        private readonly marketplaceService: MarketplaceService,
        private readonly namedUpgradeService: NamedUpgradeService,
        private readonly npcNavigationService: NPCNavigationService,
        private readonly npcStateService: NPCStateService,
        private readonly permissionsService: PermissionsService,
        private readonly playtimeService: PlaytimeService,
        private readonly questService: QuestService,
        private readonly resetService: ResetService,
        private readonly revenueService: RevenueService,
        private readonly setupService: SetupService,
        private readonly unlockedAreasService: UnlockedAreasService,
    ) {}

    /**
     * Comprehensive game utilities API exposed to items, challenges, quests, and other related content.
     *
     * Provides access to all major game services and common operations.
     */
    readonly Server = (() => {
        const t = {
            /** Whether the Server object is ready for use */
            ready: true,

            /**
             * The mutable empire data table.
             *
             * @see {@link DataService.loadedInformation} for information on how this is loaded.
             */
            empireData: this.dataService.empireData,

            /**
             * Empire and player data management service.
             *
             * @borrows DataService as dataService
             * @see {@link DataService} for more details.
             */
            Data: this.dataService,

            /**
             * Area management service.
             *
             * @borrows AreaService as areaService
             * @see {@link AreaService} for more details.
             */
            Area: this.areaService,

            /**
             * Atmosphere and weather management service.
             *
             * @borrows AtmosphereService as atmosphereService
             * @see {@link AtmosphereService} for more details.
             */
            Atmosphere: this.atmosphereService,

            /**
             * Donation management service.
             *
             * @borrows DonationService as donationService
             * @see {@link DonationService} for more details.
             */
            Donation: this.donationService,

            /**
             * Chat hook service for sending messages and managing channels.
             *
             * @borrows ChatHookService as chatHookService
             * @see {@link ChatHookService} for more details.
             */
            ChatHook: this.chatHookService,

            /**
             * Chest management service.
             *
             * @borrows ChestService as chestService
             * @see {@link ChestService} for more details.
             */
            Chest: this.chestService,

            /**
             * Currency and balance management service.
             *
             * @borrows CurrencyService as currencyService
             * @see {@link CurrencyService} for more details.
             */
            Currency: this.currencyService,

            /**
             * Dialogue service for managing NPC dialogues and interactions.
             *
             * @borrows DialogueService as dialogueService
             * @see {@link DialogueService} for more details.
             */
            Dialogue: this.dialogueService,

            /**
             * Event tracking and completion service.
             *
             * @borrows EventService as eventService
             * @see {@link EventService} for more details.
             */
            Event: this.eventService,

            /**
             * Item inventory and management service.
             *
             * @borrows ItemService as itemService
             * @see {@link ItemService} for more details.
             */
            Item: this.itemService,

            /**
             * NPC-related services for managing NPCs in the game.
             */
            NPC: {
                /**
                 * NPC navigation/pathfinding service.
                 *
                 * @borrows NPCNavigationService as npcNavigationService
                 * @see {@link NPCNavigationService} for more details.
                 */
                Navigation: this.npcNavigationService,

                /**
                 * NPC state management service.
                 *
                 * @borrows NPCStateService as npcStateService
                 * @see {@link NPCStateService} for more details.
                 */
                State: this.npcStateService,
            },

            /**
             * Playtime tracking service.
             *
             * @borrows PlaytimeService as playtimeService
             * @see {@link PlaytimeService} for more details.
             */
            Playtime: this.playtimeService,

            /**
             * Level and XP management service.
             *
             * @borrows LevelService as levelService
             * @see {@link LevelService} for more details.
             */
            Level: this.levelService,

            /**
             * Leaderboard management service.
             *
             * @borrows LeaderboardService as leaderboardService
             * @see {@link LeaderboardService} for more details.
             */
            Leaderboard: this.leaderboardService,

            /**
             * Quest management service.
             *
             * @borrows QuestService as questService
             * @see {@link QuestService} for more details.
             */
            Quest: this.questService,

            /**
             * Handles player resets and related logic.
             *
             * @borrows ResetService as resetService
             * @see {@link ResetService} for more details.
             */
            Reset: this.resetService,

            /**
             * Revenue and purchase tracking service.
             *
             * @borrows RevenueService as revenueService
             * @see {@link RevenueService} for more details.
             */
            Revenue: this.revenueService,

            /**
             * Setup and configuration management service.
             *
             * @borrows SetupService as setupService
             * @see {@link SetupService} for more details.
             */
            Setup: this.setupService,

            /**
             * Permissions management service.
             *
             * @borrows PermissionsService as permissionsService
             * @see {@link PermissionsService} for more details.
             */
            Permissions: this.permissionsService,

            /**
             * Service for unlocking and tracking areas.
             *
             * @borrows UnlockedAreasService as unlockedAreasService
             * @see {@link UnlockedAreasService} for more details.
             */
            UnlockedAreas: this.unlockedAreasService,

            /**
             * Named upgrade management service.
             *
             * @borrows NamedUpgradeService as namedUpgradeService
             * @see {@link NamedUpgradeService} for more details.
             */
            NamedUpgrade: this.namedUpgradeService,

            /**
             * Marketplace management service.
             *
             * @borrows MarketplaceService as marketplaceService
             * @see {@link MarketplaceService} for more details.
             */
            Marketplace: this.marketplaceService,

            /**
             * Reference to all registered items.
             *
             * @see {@link Items} for more details.
             */
            items: Items,
        };
        type noChecking = { [k: string]: unknown };

        for (const [k, v] of pairs(t)) (ItemUtils.Server as noChecking)[k] = v;

        this.moddingService.gameAPILoaded.fire();

        return t;
    })();

    onInit() {}
}
