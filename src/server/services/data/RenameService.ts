/**
 * @fileoverview Empire name change management system.
 *
 * This service handles:
 * - Empire name validation and filtering
 * - Cost calculation for name changes (exponential scaling)
 * - Robux and in-game currency payment methods
 * - Name uniqueness checking via leaderboards
 * - Name change history tracking
 * - Integration with product purchase system
 *
 * The service supports two payment methods:
 * - Robux purchases through MarketplaceService
 * - In-game "Funds" currency with escalating costs
 *
 * Name changes include visual/audio effects and server notifications.
 *
 * @since 1.0.0
 */

import { OnInit, OnStart, Service } from "@flamework/core";
import { OnoeNum } from "@rbxts/serikanum";
import { MarketplaceService, TextService, Workspace } from "@rbxts/services";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import { LeaderboardService } from "server/services/leaderboard/LeaderboardService";
import ChatHookService from "server/services/permissions/ChatHookService";
import PermissionService from "server/services/permissions/PermissionService";
import ProductService from "server/services/product/ProductService";
import { playSound } from "shared/asset/GameAssets";
import { getNameFromUserId } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { RENAME_PRODUCT } from "shared/devproducts/RenameProduct";
import Packets from "shared/Packets";

/**
 * Service for managing empire name changes with validation and payment processing.
 *
 * Handles both Robux and in-game currency payments, validates names for
 * appropriateness and uniqueness, and manages the complete renaming process
 * including effects and notifications.
 */
@Service()
export class RenameService implements OnInit, OnStart {
    /** Current cost for name changes in Funds currency (escalates with each change). */
    cost = this.refreshCost();

    /** Temporary storage for player names during Robux purchase flow. */
    namesPerPlayer = new Map<Player, string>();

    constructor(
        private dataService: DataService,
        private productService: ProductService,
        private leaderboardService: LeaderboardService,
        private currencyService: CurrencyService,
        private chatHookService: ChatHookService,
        private permissionsService: PermissionService,
    ) {}

    // Cost Management

    /**
     * Calculates and updates the current cost for name changes.
     * Cost increases exponentially with each name change: 1e24 * (1000 ^ nameChanges).
     *
     * @returns The updated cost as an OnoeNum.
     */
    refreshCost() {
        const cost = new OnoeNum(1e24).mul(new OnoeNum(1000).pow(this.dataService.empireData.nameChanges));
        Packets.renameCost.set(cost);
        this.cost = cost;
        return cost;
    }

    // Validation Methods

    /**
     * Validates a proposed empire name for appropriateness and uniqueness.
     *
     * @param name The proposed name to validate.
     * @param player The player requesting the name change (for filtering context).
     * @returns True if the name is valid, false otherwise.
     */
    check(name: string, player: Player) {
        // Check if name is the same as current
        if (name === this.dataService.empireData.name) {
            this.chatHookService.sendPrivateMessage(player, "Rename is same as current name. Please change it.");
            return false;
        }

        // Check content filtering
        const filtered = TextService.FilterStringAsync(name, player.UserId).GetNonChatStringForBroadcastAsync();
        if (filtered !== name) {
            this.chatHookService.sendPrivateMessage(player, "Rename is filtered. Output: " + filtered);
            return false;
        }

        // Check uniqueness via leaderboard
        if (this.leaderboardService.totalTimeStore?.GetAsync(name) !== undefined) {
            this.chatHookService.sendPrivateMessage(player, "This name is already in use.");
            return false;
        }

        return true;
    }

    // Rename Operations

    /**
     * Performs the actual empire rename with effects and notifications.
     * Updates empire data, leaderboards, and notifies all players.
     *
     * @param name The new name for the empire (will be prefixed with owner's name).
     */
    rename(name: string) {
        // Add owner prefix to the name
        name = getNameFromUserId(this.dataService.empireData.owner) + "'s " + name;

        // Play rename effects
        playSound("MagicPowerUp.mp3", Workspace);
        Packets.shakeCamera.toAllClients("Bump");
        this.chatHookService.sendServerMessage("The empire has been renamed to: " + name);

        // Update empire data
        const prev = this.dataService.empireData.name;
        this.dataService.empireData.name = name;

        // Update leaderboards asynchronously
        task.spawn(() => this.leaderboardService.updateLeaderboards(prev));

        // Sync to clients
        Packets.empireName.set(name);

        // Track name history
        this.dataService.empireData.previousNames.add(prev);
        this.dataService.empireData.previousNames.delete(name); // Remove if name was used before
    }

    // Service Lifecycle

    onInit() {
        // Handle rename requests
        Packets.promptRename.fromClient((player, name, method) => {
            // Check permissions
            if (this.permissionsService.checkPermLevel(player, "purchase") === false) {
                return false;
            }

            // Sanitize name (remove special characters)
            [name] = name.gsub("[^%w_ ]", "");
            const size = name.size();

            // Validate name length
            if (size > 16 || size < 5) return false;

            if (method === "robux") {
                // Store name for Robux purchase flow
                this.namesPerPlayer.set(player, name);
                MarketplaceService.PromptProductPurchase(player, RENAME_PRODUCT);
            } else {
                // Handle in-game currency purchase
                if (!this.check(name, player)) return false;

                // Attempt purchase with Funds
                if (!this.currencyService.purchase(new CurrencyBundle().set("Funds", this.cost))) return false;

                // Perform rename and update cost
                this.rename(name);
                ++this.dataService.empireData.nameChanges;
                this.refreshCost();
            }
            return true;
        });

        // Set up Robux product purchase handler
        this.productService.setProductFunction(RENAME_PRODUCT, (_receiptInfo, player) => {
            const name = this.namesPerPlayer.get(player);

            // Validate stored name
            if (name === undefined || !this.check(name, player)) return Enum.ProductPurchaseDecision.NotProcessedYet;

            // Perform rename (no cost increment for Robux purchases)
            this.rename(name);
            return Enum.ProductPurchaseDecision.PurchaseGranted;
        });
    }

    onStart() {
        // Send initial empire name to clients
        Packets.empireName.set(this.dataService.empireData.name);
    }
}
