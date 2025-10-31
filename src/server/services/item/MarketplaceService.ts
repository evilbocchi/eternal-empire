/**
 * @fileoverview Core marketplace service for managing item listings and transactions.
 *
 * This service handles:
 * - Creating and managing marketplace listings
 * - Processing buyouts and auction bids
 * - Maintaining listing state with DataStore operations
 * - Anti-dupe protection using UpdateAsync
 * - Integration with external trade token system
 * - Automatic listing expiry and cleanup
 *
 * The service uses one DataStore key per auction to minimize dupe risk
 * and ensure atomic operations for all critical modifications.
 *
 * @since 1.0.0
 */

import { OnInit, OnStart, Service } from "@flamework/core";
import { DataStoreService, HttpService, RunService } from "@rbxts/services";
import { $env } from "rbxts-transform-env";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import ItemService from "server/services/item/ItemService";
import PermissionService from "server/services/permissions/PermissionService";
import { IS_STUDIO } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import MARKETPLACE_CONFIG from "shared/marketplace/MarketplaceListing";
import Packets from "shared/Packets";

/**
 * Core marketplace service handling all marketplace operations.
 */
@Service()
export default class MarketplaceService implements OnInit, OnStart {
    private readonly WEBHOOK = $env.string("TRADE_WEBHOOK");

    private readonly empireData: EmpireData;
    private readonly empireId: string;

    private readonly MARKETPLACE_STORE = (() => {
        try {
            const store = DataStoreService.GetDataStore(MARKETPLACE_CONFIG.DATASTORE_NAME);
            return store;
        } catch (err) {
            if (!IS_STUDIO) warn(`Failed to get Marketplace DataStore: ${err}`);
            return undefined;
        }
    })();

    private readonly INDEX_STORE = (() => {
        try {
            const store = DataStoreService.GetDataStore(MARKETPLACE_CONFIG.INDEX_DATASTORE_NAME);
            return store;
        } catch (err) {
            if (!IS_STUDIO) warn(`Failed to get Marketplace Index DataStore: ${err}`);
            return undefined;
        }
    })();

    private readonly HISTORY_STORE = (() => {
        try {
            const store = DataStoreService.GetDataStore(MARKETPLACE_CONFIG.HISTORY_DATASTORE_NAME);
            return store;
        } catch (err) {
            if (!IS_STUDIO) warn(`Failed to get Marketplace History DataStore: ${err}`);
            return undefined;
        }
    })();

    constructor(
        private readonly currencyService: CurrencyService,
        private readonly dataService: DataService,
        private readonly itemService: ItemService,
        private readonly permissionsService: PermissionService,
    ) {
        this.empireData = this.dataService.empireData;
        this.empireId = this.dataService.empireId;
    }

    onInit() {
        // Set up packet handlers
        Packets.createListing.fromClient((player, uuid, price) => {
            try {
                return this.createListing(player, uuid, price);
            } catch (error) {
                warn("Error creating marketplace listing:", error);
                return false;
            }
        });

        Packets.cancelListing.fromClient((player, uuid) => {
            try {
                return this.cancelListing(player, uuid);
            } catch (error) {
                warn("Error cancelling marketplace listing:", error);
                return false;
            }
        });

        Packets.buyListing.fromClient((player, uuid) => {
            return this.buyListing(player, uuid);
        });

        Packets.searchListings.fromClient((player, searchQuery, page) => {
            return this.searchListings(player, searchQuery, page);
        });
    }

    onStart() {
        // Start cleanup cycle for expired listings every 5 minutes (300 seconds)
        const CLEANUP_INTERVAL = 300; // seconds
        let lastCleanup = 0;
        const connection = RunService.Heartbeat.Connect(() => {
            const now = os.time();
            if (now - lastCleanup >= CLEANUP_INTERVAL) {
                lastCleanup = now;
                this.cleanupExpiredListings();
            }
        });
        eat(connection);

        Packets.empireActiveListings.set(this.empireData.marketplaceListed);
    }

    public searchListings(player: Player | undefined, searchQuery: string, page: number): MarketplaceListing[] {
        if (!this.isOperational(player)) return [];

        return [];
    }

    /**
     * Creates a new marketplace listing to sell from the current empire's inventory.
     * @param player The player creating the listing (optional).
     * @param uuid The UUID of the unique item being listed.
     * @param price The price of the listing.
     * @returns True if the listing was created successfully, false otherwise.
     */
    public createListing(player: Player | undefined, uuid: string, price: number): boolean {
        if (!this.isOperational(player)) return false;

        const uniqueItem = this.empireData.items.uniqueInstances.get(uuid);
        if (!uniqueItem) return false; // Empire doesn't own this item
        if (uniqueItem.placed !== undefined) return false; // Item is currently placed

        // Validate price is within allowed range
        if (price < MARKETPLACE_CONFIG.MIN_LISTING_PRICE || price > MARKETPLACE_CONFIG.MAX_LISTING_PRICE) {
            return false;
        }

        // Remove item from empire's inventory
        if (!this.empireData.items.uniqueInstances.delete(uuid)) {
            return false;
        }

        // Create the listing
        let listing: MarketplaceListing | undefined;
        try {
            [listing] = this.MARKETPLACE_STORE!.UpdateAsync(uuid, (oldListing: MarketplaceListing | undefined) => {
                if (oldListing !== undefined && oldListing.bought === false) {
                    warn("Listing creation failed - duplicate UUID");
                    // Listing already exists for this UUID and is still active
                    return $tuple(undefined);
                }

                const created = os.time();
                return $tuple({
                    uuid,
                    price,
                    created,
                    uniqueItem,
                    sellerEmpireId: this.empireId,
                    bought: false,
                });
            });
        } catch (error) {
            warn("Error creating marketplace listing:", error);
        }

        if (listing === undefined || listing.sellerEmpireId !== this.empireId) {
            // Return item to empire's inventory if listing creation failed
            this.empireData.items.uniqueInstances.set(uuid, uniqueItem);
            return false;
        }

        this.empireData.marketplaceListed.set(uuid, listing);
        this.itemService.requestChanges();
        Packets.empireActiveListings.set(this.empireData.marketplaceListed);
        print("Created marketplace listing:", listing);

        return true;
    }

    /**
     * Cancels an existing listing made by the current empire.
     * @param player The player cancelling the listing (optional).
     * @param uuid The UUID of the listing to cancel.
     * @returns True if the listing was cancelled successfully, false otherwise.
     */
    public cancelListing(player: Player | undefined, uuid: string): boolean {
        if (!this.isOperational(player)) return false;

        // Use UpdateAsync to atomically mark listing as inactive and return item
        let listing: MarketplaceListing | undefined;
        try {
            [listing] = this.MARKETPLACE_STORE!.UpdateAsync(uuid, (oldListing: MarketplaceListing | undefined) => {
                if (oldListing === undefined) {
                    print("Cannot cancel listing - does not exist:", uuid);
                    return $tuple(undefined);
                }
                if (oldListing.sellerEmpireId !== this.empireId) {
                    print("Cannot cancel listing - not owned by this empire:", uuid);
                    return $tuple(undefined);
                }

                if (oldListing.lock !== undefined) {
                    const lockAge = os.time() - (oldListing.lockedAt ?? 0);
                    if (lockAge < MARKETPLACE_CONFIG.LOCK_TIMEOUT) {
                        // Listing is locked by another transaction
                        print("Cannot cancel listing - currently locked:", uuid);
                        return $tuple(undefined);
                    }
                }

                oldListing.lock = undefined;
                oldListing.lockedAt = undefined;
                oldListing.bought = true;
                return $tuple(oldListing);
            });
        } catch (error) {
            warn("Error cancelling marketplace listing:", error);
        }

        // Check if cancellation was successful
        if (
            listing === undefined ||
            listing.sellerEmpireId !== this.empireId ||
            listing.lock !== undefined ||
            listing.lockedAt !== undefined ||
            listing.bought !== true
        ) {
            return false;
        }

        // Return item to this empire's inventory
        this.empireData.items.uniqueInstances.set(uuid, listing.uniqueItem);
        this.empireData.marketplaceListed.delete(uuid);
        this.itemService.requestChanges();
        Packets.empireActiveListings.set(this.empireData.marketplaceListed);
        print("Cancelled marketplace listing:", listing);

        return true;
    }

    /**
     * Processes a buyout purchase.
     * @param player The player buying the listing (optional).
     * @param uuid The UUID of the listing to buy.
     * @returns True if the purchase was successful, false otherwise.
     */
    public buyListing(player: Player | undefined, uuid: string): boolean {
        if (!this.isOperational(player)) return false;

        // Create processing token before starting transaction
        const token: TradeToken = {
            buyerEmpireId: this.empireId,
            sellerEmpireId: "", // Will be filled from listing
            uuid,
            price: 0, // Will be filled from listing
            timestamp: os.time(),
            status: "processing",
        };

        try {
            // Validate listing and lock it for processing
            const [listing] = this.MARKETPLACE_STORE!.UpdateAsync(uuid, (listing: MarketplaceListing | undefined) => {
                if (listing === undefined || listing.lock !== undefined || listing.sellerEmpireId === this.empireId) {
                    return $tuple(undefined);
                }

                listing.lock = this.empireId; // Lock the listing to prevent concurrent purchases
                listing.lockedAt = os.time();
                return $tuple(listing);
            });

            // Re-verify information to prevent TOCTOU issues
            if (
                listing === undefined ||
                listing.sellerEmpireId === this.empireId ||
                listing.lock !== this.empireId ||
                listing.bought === true
            ) {
                return false;
            }

            // Update token with actual details
            token.sellerEmpireId = listing.sellerEmpireId;
            token.price = listing.price;

            // Upload processing token to external system
            this.uploadTradeToken(uuid, token);

            // Process payment
            const success = this.currencyService.purchase(new CurrencyBundle().set("Diamonds", listing.price));
            if (!success) {
                token.status = "failed";
                this.uploadTradeToken(uuid, token);

                // Reactivate listing if payment failed
                this.MARKETPLACE_STORE!.UpdateAsync(uuid, (listing: MarketplaceListing | undefined) => {
                    if (
                        listing === undefined ||
                        listing.sellerEmpireId === this.empireId ||
                        listing.lock !== this.empireId ||
                        listing.bought === true
                    ) {
                        return $tuple(undefined);
                    }

                    listing.lock = undefined;
                    listing.lockedAt = undefined;
                    return $tuple(listing);
                });

                return false;
            }

            // Mark listing as sold
            let [newListing] = this.MARKETPLACE_STORE!.UpdateAsync(uuid, (listing: MarketplaceListing | undefined) => {
                if (
                    listing === undefined ||
                    listing.sellerEmpireId === this.empireId ||
                    listing.lock !== this.empireId ||
                    listing.bought === true
                ) {
                    return $tuple(undefined);
                }
                listing.bought = true;
                return $tuple(listing);
            });

            if (
                newListing === undefined ||
                newListing.sellerEmpireId !== listing.sellerEmpireId ||
                newListing.bought !== true
            ) {
                warn("Failed to mark listing as sold:", uuid);
                token.status = "failed";
                this.uploadTradeToken(uuid, token);
                return false;
            }

            // Add item to buyer's inventory
            const empireData = this.dataService.empireData;
            empireData.items.uniqueInstances.set(uuid, listing.uniqueItem);

            // Record transaction
            const transaction: MarketplaceTransaction = {
                uuid,
                baseItemId: listing.uniqueItem.baseItemId,
                sellerEmpireId: listing.sellerEmpireId,
                buyerEmpireId: this.empireId,
                price: listing.price,
                timestamp: os.time(),
            };

            this.HISTORY_STORE!.UpdateAsync(uuid, (history: MarketplaceTransaction[] | undefined) => {
                return $tuple(history ? [...history, transaction] : [transaction]);
            });

            // Complete token
            token.status = "completed";
            this.uploadTradeToken(uuid, token);

            // Send webhook notification
            this.sendTradeWebhook(transaction);
            return true;
        } catch (error) {
            warn("Error processing buyout:", error);
            token.status = "failed";
            this.uploadTradeToken(uuid, token);
            return false;
        }
    }

    /**
     * Uploads a trade token to external system for recovery.
     */
    private uploadTradeToken(tokenId: string, token: TradeToken) {
        if (this.WEBHOOK === undefined) {
            return;
        }

        try {
            const payload = {
                tokenId: tokenId,
                token: token,
                timestamp: os.time(),
            };

            HttpService.PostAsync(this.WEBHOOK, HttpService.JSONEncode(payload), Enum.HttpContentType.ApplicationJson);
        } catch (error) {
            warn("Failed to upload trade token:", error);
        }
    }

    /**
     * Cleans up expired listings made by this empire.
     */
    private cleanupExpiredListings(): void {
        let changed = false;
        for (const [uuid, listing] of this.empireData.marketplaceListed) {
            if (os.time() < listing.created + MARKETPLACE_CONFIG.LISTING_DURATION || listing.bought) {
                continue;
            }

            try {
                let [newListing] = this.MARKETPLACE_STORE!.UpdateAsync(
                    uuid,
                    (oldListing: MarketplaceListing | undefined) => {
                        if (oldListing === undefined) {
                            print("Cannot clean up listing - does not exist:", uuid);
                            return $tuple(undefined);
                        }
                        if (oldListing.sellerEmpireId !== this.empireId) {
                            print("Cannot clean up listing - not owned by this empire:", uuid);
                            return $tuple(undefined);
                        }
                        if (oldListing.bought === true) {
                            print("Cannot clean up listing - already sold:", uuid);
                            return $tuple(undefined);
                        }

                        if (oldListing.lock !== undefined) {
                            const lockAge = os.time() - (oldListing.lockedAt ?? 0);
                            if (lockAge < MARKETPLACE_CONFIG.LOCK_TIMEOUT) {
                                // Listing is locked by another transaction
                                print("Cannot clean up listing - currently locked:", uuid);
                                return $tuple(undefined);
                            }
                        }

                        // Mark listing as expired
                        oldListing.lock = undefined;
                        oldListing.lockedAt = undefined;
                        oldListing.bought = true;
                        return $tuple(oldListing);
                    },
                );

                if (
                    newListing === undefined ||
                    newListing.sellerEmpireId !== this.empireId ||
                    newListing.bought !== true ||
                    newListing.lock !== undefined ||
                    newListing.lockedAt !== undefined
                ) {
                    print("Failed to clean up listing - could not mark as expired:", uuid);
                    continue;
                }

                // Return item to this empire's inventory
                this.empireData.items.uniqueInstances.set(uuid, newListing.uniqueItem);
                this.empireData.marketplaceListed.delete(uuid);
                changed = true;
            } catch (error) {
                warn("Error removing expired listing from DataStore:", error);
                continue;
            }
        }

        if (changed) {
            this.itemService.requestChanges();
            Packets.empireActiveListings.set(this.empireData.marketplaceListed);
        }
    }

    /**
     * Checks if the marketplace is operational for a given player.
     * @param player The player to check permissions for (optional).
     * @returns True if operational, false otherwise.
     */
    private isOperational(player?: Player) {
        if (!MARKETPLACE_CONFIG.ENABLED || !this.MARKETPLACE_STORE || !this.INDEX_STORE || !this.HISTORY_STORE)
            return false;
        if (player !== undefined && !this.permissionsService.checkPermLevel(player, "marketplace")) return false;
        return true;
    }

    /**
     * Sends a webhook notification for a completed trade.
     * @param transaction The transaction details.
     * @return True if the webhook was sent successfully, false otherwise.
     */
    private async sendTradeWebhook(transaction: MarketplaceTransaction): Promise<boolean> {
        try {
            const payload = {
                type: "trade_completed",
                transaction: transaction,
                timestamp: os.time(),
            };

            if (this.WEBHOOK !== undefined) {
                HttpService.PostAsync(
                    this.WEBHOOK,
                    HttpService.JSONEncode(payload),
                    Enum.HttpContentType.ApplicationJson,
                );
                return true;
            }
        } catch (error) {
            warn("Failed to send trade webhook:", error);
        }
        return false;
    }
}
