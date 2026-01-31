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

import { Service } from "@flamework/core";
import ProgressionEstimationService from "server/services/analytics/ProgressionEstimationService";
import { ChallengeService } from "server/services/ChallengeService";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import EventService from "server/services/data/EventService";
import HamsterService from "server/services/data/HamsterService";
import LevelService from "server/services/data/LevelService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import PlaytimeService from "server/services/data/PlaytimeService";
import QuestService from "server/services/data/QuestService";
import SetupService from "server/services/data/SetupService";
import { DonationService } from "server/services/DonationService";
import ItemService from "server/services/item/ItemService";
import MarketplaceService from "server/services/item/MarketplaceService";
import ResearchService from "server/services/item/ResearchService";
import LeaderboardChangeService from "server/services/leaderboard/LeaderboardChangeService";
import { LeaderboardService } from "server/services/leaderboard/LeaderboardService";
import ModdingService from "server/services/ModdingService";
import ChatHookService from "server/services/permissions/ChatHookService";
import CommandsService from "server/services/permissions/CommandsService";
import PermissionService from "server/services/permissions/PermissionService";
import ResetService from "server/services/ResetService";
import RevenueService from "server/services/RevenueService";
import AreaService from "server/services/world/AreaService";
import AtmosphereService from "server/services/world/AtmosphereService";
import ChestService from "server/services/world/ChestService";
import { Server } from "shared/api/APIExpose";
import AvailableEmpire from "shared/data/AvailableEmpire";
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
export default class APIExposeService {
    constructor(
        private readonly areaService: AreaService,
        private readonly atmosphereService: AtmosphereService,
        private readonly challengeService: ChallengeService,
        private readonly chatHookService: ChatHookService,
        private readonly chestService: ChestService,
        private readonly commandsService: CommandsService,
        private readonly currencyService: CurrencyService,
        private readonly dataService: DataService,
        private readonly donationService: DonationService,
        private readonly eventService: EventService,
        private readonly hamsterService: HamsterService,
        private readonly itemService: ItemService,
        private readonly levelService: LevelService,
        private readonly leaderboardService: LeaderboardService,
        private readonly leaderboardChangeService: LeaderboardChangeService,
        private readonly moddingService: ModdingService,
        private readonly marketplaceService: MarketplaceService,
        private readonly namedUpgradeService: NamedUpgradeService,
        private readonly permissionsService: PermissionService,
        private readonly progressionEstimationService: ProgressionEstimationService,
        private readonly playtimeService: PlaytimeService,
        private readonly questService: QuestService,
        private readonly researchService: ResearchService,
        private readonly resetService: ResetService,
        private readonly revenueService: RevenueService,
        private readonly setupService: SetupService,
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
            empireData: this.dataService.empireData,

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
             * Challenge management service.
             *
             * @borrows ChallengeService as challengeService
             * @see {@link ChallengeService} for more details.
             */
            Challenge: this.challengeService,

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
             * Command management service.
             * @borrows CommandsService as commandsService
             * @see {@link CommandsService} for more details.
             */
            Command: this.commandsService,

            /**
             * Currency and balance management service.
             *
             * @borrows CurrencyService as currencyService
             * @see {@link CurrencyService} for more details.
             */
            Currency: this.currencyService,

            /**
             * Empire data management service.
             *
             * @borrows DataService as dataService
             * @see {@link DataService} for more details.
             * @internal Use {@link ThisEmpire} instead.
             */
            Data: this.dataService,

            /**
             * Event tracking and completion service.
             *
             * @borrows EventService as eventService
             * @see {@link EventService} for more details.
             */
            Event: this.eventService,

            /**
             * The hamster that keeps the wheels turning.
             *
             * @borrows HamsterService as hamsterService
             * @see {@link HamsterService} for more details.
             */
            Hamster: this.hamsterService,

            /**
             * Item inventory and management service.
             *
             * @borrows ItemService as itemService
             * @see {@link ItemService} for more details.
             */
            Item: this.itemService,

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
             * Leaderboard change service.
             *
             * @borrows LeaderboardChangeService as leaderboardChangeService
             * @see {@link LeaderboardChangeService} for more details.
             */
            LeaderboardChange: this.leaderboardChangeService,

            /**
             * Quest management service.
             *
             * @borrows QuestService as questService
             * @see {@link QuestService} for more details.
             */
            Quest: this.questService,

            /**
             * Research and difficulty power management service.
             * @borrows ResearchService as researchService
             * @see {@link ResearchService} for more details.
             */
            Research: this.researchService,

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
             * @see {@link PermissionService} for more details.
             */
            Permissions: this.permissionsService,

            /**
             * Progression estimation and analytics service.
             * @borrows ProgressionEstimationService as progressionEstimationService
             * @see {@link ProgressionEstimationService} for more details.
             */
            ProgressEstimation: this.progressionEstimationService,

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
             * Player data.
             */
            dataPerPlayer: AvailableEmpire.dataPerPlayer,

            /**
             * Exposed {@link Items} reference.
             * Useful for avoiding circular dependencies when importing from `shared/item/`.
             * @see {@link Items} for more details.
             */
            Items: Items,
        };
        type noChecking = { [k: string]: unknown };

        for (const [k, v] of pairs(t)) (Server as noChecking)[k] = v;

        this.moddingService.gameAPILoaded.fire();

        return t;
    })();
}
