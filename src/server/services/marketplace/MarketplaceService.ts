//!native
//!optimize 2

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

import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, OnStart, Service } from "@flamework/core";
import { DataStoreService, HttpService, RunService } from "@rbxts/services";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { EmpireProfileManager } from "shared/data/profile/ProfileManager";
import eat from "shared/hamster/eat";
import MARKETPLACE_CONFIG from "shared/marketplace/MarketplaceListing";
import Packets from "shared/Packets";

/**
 * Core marketplace service handling all marketplace operations.
 */
@Service()
export default class MarketplaceService implements OnInit, OnStart {
    private marketplaceDataStore = DataStoreService.GetDataStore(MARKETPLACE_CONFIG.DATASTORE_NAME);
    private tokensDataStore = DataStoreService.GetDataStore(MARKETPLACE_CONFIG.TOKENS_DATASTORE_NAME);
    private historyDataStore = DataStoreService.GetDataStore(MARKETPLACE_CONFIG.HISTORY_DATASTORE_NAME);

    private isMarketplaceEnabled = true;

    // External webhook URL for trade tokens (set via admin commands)
    private tradeTokenWebhook?: string;

    // Events
    public readonly listingCreated = new Signal<(listing: MarketplaceListing) => void>();
    public readonly listingUpdated = new Signal<(listing: MarketplaceListing) => void>();
    public readonly listingCancelled = new Signal<(uuid: string, sellerId: number) => void>();
    public readonly itemSold = new Signal<(transaction: MarketplaceTransaction) => void>();

    constructor(
        private currencyService: CurrencyService,
        private dataService: DataService,
    ) {}

    onInit() {
        // Set up packet handlers
        Packets.createListing.fromClient((player, uuid, price, listingType, duration) => {
            return this.createListing(player, uuid, price, listingType, duration);
        });

        Packets.cancelListing.fromClient((player, uuid) => {
            return this.cancelListing(player, uuid);
        });

        Packets.buyListing.fromClient((player, uuid) => {
            return this.buyListing(player, uuid);
        });

        Packets.placeBid.fromClient((player, uuid, bidAmount) => {
            return this.placeBid(player, uuid, bidAmount);
        });
    }

    onStart() {
        // Start cleanup cycle for expired listings
        const connection = RunService.Heartbeat.Connect(() => {
            this.cleanupExpiredListings();
        });
        eat(connection);

        // Recover any interrupted trades on startup
        task.spawn(() => this.recoverInterruptedTrades());

        // Load active listings and update clients
        task.spawn(() => this.refreshMarketplaceListings());
    }

    /**
     * Creates a new marketplace listing.
     */
    createListing(player: Player, uuid: string, price: number, listingType: "buyout" | "auction", duration: number) {
        if (!this.isMarketplaceEnabled) {
            return false;
        }

        try {
            // Validate that player owns the unique item
            const empireData = this.dataService.empireData;
            const uniqueItem = empireData.items.uniqueInstances.get(uuid);

            if (!uniqueItem) {
                return false; // Player doesn't own this item
            }

            // Check if item is currently placed (can't sell placed items)
            if (uniqueItem.placed !== undefined) {
                return false; // Item is currently placed
            }

            // Validate price
            if (price < MARKETPLACE_CONFIG.MIN_LISTING_PRICE || price > MARKETPLACE_CONFIG.MAX_LISTING_PRICE) {
                return false;
            }

            // Check player's active listings count
            const playerListings = this.getPlayerActiveListings(player.UserId);
            if (playerListings.size() >= MARKETPLACE_CONFIG.MAX_LISTINGS_PER_PLAYER) {
                return false;
            }

            // Calculate listing fee
            const listingFee = math.ceil(price * MARKETPLACE_CONFIG.LISTING_FEE_PERCENTAGE * 100) / 100;

            // Charge listing fee
            if (!this.currencyService.purchase(new CurrencyBundle().set("Diamonds", listingFee))) return false;

            const listingUniquePots = new Map<string, number>();
            for (const [potName, potValue] of uniqueItem.pots) {
                listingUniquePots.set(potName, potValue);
            }
            const listingUniqueItem: UniqueItemInstance = {
                baseItemId: uniqueItem.baseItemId,
                pots: listingUniquePots,
                created: uniqueItem.created,
            };
            if (uniqueItem.placed !== undefined) {
                listingUniqueItem.placed = uniqueItem.placed;
            }

            // Create the listing
            const expires =
                duration > 0 ? os.time() + duration : os.time() + MARKETPLACE_CONFIG.DEFAULT_LISTING_DURATION;
            const listing: MarketplaceListing = {
                uuid: uuid,
                sellerId: player.UserId,
                sellerEmpireId: this.dataService.empireId,
                price: price,
                listingType: listingType,
                created: os.time(),
                expires: expires,
                listingFee: listingFee,
                uniqueItem: listingUniqueItem,
                active: true,
            };

            // Store in DataStore using UpdateAsync for atomicity
            const [success] = this.marketplaceDataStore.UpdateAsync(
                uuid,
                (oldListing: MarketplaceListing | undefined, keyInfo: DataStoreKeyInfo | undefined) => {
                    if (oldListing !== undefined && oldListing.active) {
                        // Listing already exists for this UUID, do not overwrite
                        return $tuple(oldListing);
                    }
                    return $tuple(listing);
                },
            );

            if (success === undefined) {
                // Refund listing fee
                this.currencyService.increment("Diamonds", new OnoeNum(listingFee));
                return false;
            }

            // Remove item from player's inventory
            empireData.items.uniqueInstances.delete(uuid);

            // Fire events
            this.listingCreated.fire(listing);

            // Send individual listing update to clients
            Packets.listingUpdated.toAllClients(listing);

            this.refreshMarketplaceListings();

            return true;
        } catch (error) {
            warn("Error creating marketplace listing:", error);
            return false;
        }
    }

    /**
     * Cancels an existing listing.
     */
    cancelListing(player: Player, uuid: string): boolean {
        if (!this.isMarketplaceEnabled) {
            return false;
        }

        try {
            const [listing] = this.marketplaceDataStore.UpdateAsync(
                uuid,
                (oldListing: MarketplaceListing | undefined) => {
                    if (oldListing === undefined || !oldListing.active || oldListing.sellerId !== player.UserId) {
                        return $tuple(oldListing);
                    }

                    // Mark as inactive
                    const updatedListing = { ...oldListing, active: false };
                    return $tuple(updatedListing);
                },
            );

            if (listing === undefined || listing.sellerId !== player.UserId) {
                return false;
            }

            // Return item to player's inventory
            const empireData = this.dataService.empireData;

            const uniqueItemData = listing.uniqueItem;
            if (uniqueItemData !== undefined) {
                const restoredPots = new Map<string, number>();
                for (const [potName, potValue] of uniqueItemData.pots) {
                    restoredPots.set(potName, potValue);
                }

                const restoredUniqueItem: UniqueItemInstance = {
                    baseItemId: uniqueItemData.baseItemId,
                    pots: restoredPots,
                    created: uniqueItemData.created,
                };
                if (uniqueItemData.placed !== undefined) {
                    restoredUniqueItem.placed = uniqueItemData.placed;
                }

                empireData.items.uniqueInstances.set(uuid, restoredUniqueItem);
            } else {
                warn(`Marketplace listing ${uuid} missing unique item data during cancel; fabricating placeholder.`);
                const fallbackUniqueItem: UniqueItemInstance = {
                    baseItemId: "unknown",
                    pots: new Map(),
                    created: os.time(),
                };
                empireData.items.uniqueInstances.set(uuid, fallbackUniqueItem);
            }

            // Refund listing fee (50% penalty)
            if (listing.listingFee !== undefined) {
                const refund = listing.listingFee * 0.5;
                this.currencyService.increment("Diamonds", new OnoeNum(refund));
            }

            // Fire events
            this.listingCancelled.fire(uuid, player.UserId);

            // Send listing removal to clients
            Packets.listingRemoved.toAllClients(uuid);

            this.refreshMarketplaceListings();

            return true;
        } catch (error) {
            warn("Error cancelling marketplace listing:", error);
            return false;
        }
    }

    /**
     * Processes a buyout purchase.
     */
    buyListing(player: Player, uuid: string): boolean {
        if (!this.isMarketplaceEnabled) {
            return false;
        }

        // Create processing token before starting transaction
        const token: TradeToken = {
            empireKey: this.dataService.empireId,
            buyerEmpireId: this.dataService.empireId,
            buyerId: player.UserId,
            sellerEmpireId: "",
            sellerId: 0,
            uuid,
            price: 0, // Will be filled from listing
            timestamp: os.time(),
            status: "processing",
        };

        try {
            // First, get the listing and validate
            const [listing] = this.marketplaceDataStore.UpdateAsync(
                uuid,
                (oldListing: MarketplaceListing | undefined) => {
                    if (oldListing === undefined || !oldListing.active || oldListing.sellerId === player.UserId) {
                        return $tuple(oldListing);
                    }

                    if (oldListing.listingType !== "buyout") {
                        return $tuple(oldListing);
                    }

                    // Mark as sold
                    const updatedListing = { ...oldListing, active: false };
                    return $tuple(updatedListing);
                },
            );

            if (listing === undefined || listing.listingType !== "buyout") {
                return false;
            }

            // Update token with actual details
            token.sellerId = listing.sellerId;
            token.sellerEmpireId = listing.sellerEmpireId;
            token.price = listing.price;

            // Upload processing token to external system
            this.uploadTradeToken(uuid, token);

            // Process payment
            const success = this.currencyService.purchase(new CurrencyBundle().set("Diamonds", listing.price));
            if (!success) {
                token.status = "failed";
                this.uploadTradeToken(uuid, token);
                return false;
            }

            // Calculate taxes
            const tax = listing.price * MARKETPLACE_CONFIG.TRANSACTION_TAX_PERCENTAGE;
            const sellerProceeds = listing.price - tax;

            // Add item to buyer's inventory
            const empireData = this.dataService.empireData;
            const listingUniqueItem = listing.uniqueItem;

            let grantedUniqueItem: UniqueItemInstance;
            if (listingUniqueItem !== undefined) {
                const grantedPots = new Map<string, number>();
                for (const [potName, potValue] of listingUniqueItem.pots) {
                    grantedPots.set(potName, potValue);
                }
                grantedUniqueItem = {
                    baseItemId: listingUniqueItem.baseItemId,
                    pots: grantedPots,
                    created: listingUniqueItem.created,
                };
                if (listingUniqueItem.placed !== undefined) {
                    grantedUniqueItem.placed = listingUniqueItem.placed;
                }
            } else {
                warn(`Marketplace listing ${uuid} missing unique item data during purchase; fabricating placeholder.`);
                grantedUniqueItem = {
                    baseItemId: "unknown",
                    pots: new Map(),
                    created: os.time(),
                };
            }

            empireData.items.uniqueInstances.set(uuid, grantedUniqueItem);

            // Record transaction
            const transaction: MarketplaceTransaction = {
                uuid,
                baseItemId: grantedUniqueItem.baseItemId,
                sellerId: listing.sellerId,
                buyerId: player.UserId,
                price: listing.price,
                timestamp: os.time(),
                type: "buyout",
            };

            this.historyDataStore.SetAsync(uuid, transaction);

            // Complete token
            token.status = "completed";
            this.uploadTradeToken(uuid, token);

            // Fire events
            this.itemSold.fire(transaction);

            // Send transaction notification to clients
            Packets.marketplaceTransaction.toAllClients(transaction);

            // Send listing removal to clients
            Packets.listingRemoved.toAllClients(uuid);

            this.refreshMarketplaceListings();

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
     * Places a bid on an auction.
     */
    placeBid(player: Player, uuid: string, bidAmount: number): boolean {
        if (!this.isMarketplaceEnabled) {
            return false;
        }

        try {
            // Check if player can afford bid
            if (!this.currencyService.canAfford(new CurrencyBundle().set("Diamonds", bidAmount))) {
                return false;
            }

            const [listing] = this.marketplaceDataStore.UpdateAsync(
                uuid,
                (oldListing: MarketplaceListing | undefined) => {
                    if (oldListing === undefined || !oldListing.active || oldListing.listingType !== "auction") {
                        return $tuple(oldListing);
                    }

                    // Check if bid is higher than current bid
                    const currentBidValue = oldListing.currentBid ?? oldListing.price;
                    const newBidValue = bidAmount;

                    if (currentBidValue === undefined || newBidValue === undefined || newBidValue <= currentBidValue) {
                        return $tuple(oldListing);
                    }

                    // Update with new bid
                    const updatedListing = {
                        ...oldListing,
                        currentBid: bidAmount,
                        currentBidderId: player.UserId,
                        currentBidderEmpireId: this.dataService.empireId,
                    };
                    return $tuple(updatedListing);
                },
            );

            if (listing === undefined || listing.currentBidderId !== player.UserId) {
                return false;
            }

            // Process bid payment (held in escrow)
            if (!this.currencyService.purchase(new CurrencyBundle().set("Diamonds", bidAmount))) {
                return false;
            }

            // Fire events
            this.listingUpdated.fire(listing);

            // Send individual listing update to clients
            Packets.listingUpdated.toAllClients(listing);

            return true;
        } catch (error) {
            warn("Error placing bid:", error);
            return false;
        }
    }

    /**
     * Gets marketplace listings.
     */
    getMarketplaceListings(): MarketplaceListing[] {
        try {
            const listings: MarketplaceListing[] = [];
            const currentTime = os.time();

            // Use ListKeysAsync to iterate through all marketplace listings
            const [success, pages] = pcall(() => this.marketplaceDataStore.ListKeysAsync());

            if (!success || pages === undefined) {
                warn("Failed to list marketplace keys:", pages);
                return listings;
            }

            while (true) {
                const keys = pages.GetCurrentPage();

                for (const item of keys) {
                    const keyInfo = item as DataStoreKey;
                    const [getSuccess, result] = pcall(() => this.marketplaceDataStore.GetAsync(keyInfo.KeyName));

                    if (getSuccess && result !== undefined) {
                        const [listing] = result as LuaTuple<[MarketplaceListing | undefined]>;

                        if (listing !== undefined && listing.active) {
                            // Filter out expired listings
                            if (listing.expires === undefined || listing.expires > currentTime) {
                                listings.push(listing);
                            }
                        }
                    }
                }

                if (pages.IsFinished) {
                    break;
                }

                const [advanceSuccess] = pcall(() => pages.AdvanceToNextPageAsync());
                if (!advanceSuccess) {
                    break;
                }
            }

            return listings;
        } catch (error) {
            warn("Error getting marketplace listings:", error);
            return [];
        }
    }

    /**
     * Gets active listings for a specific player.
     */
    private getPlayerActiveListings(userId: number): MarketplaceListing[] {
        try {
            const listings: MarketplaceListing[] = [];
            const currentTime = os.time();

            // Use ListKeysAsync to iterate through all marketplace listings
            const [success, pages] = pcall(() => this.marketplaceDataStore.ListKeysAsync());

            if (!success || pages === undefined) {
                warn("Failed to list marketplace keys for player:", pages);
                return listings;
            }

            while (true) {
                const keys = pages.GetCurrentPage();

                for (const item of keys) {
                    const keyInfo = item as DataStoreKey;
                    const [getSuccess, result] = pcall(() => this.marketplaceDataStore.GetAsync(keyInfo.KeyName));

                    if (getSuccess && result !== undefined) {
                        const [listing] = result as LuaTuple<[MarketplaceListing | undefined]>;

                        if (listing !== undefined && listing.active && listing.sellerId === userId) {
                            // Filter out expired listings
                            if (listing.expires === undefined || listing.expires > currentTime) {
                                listings.push(listing);
                            }
                        }
                    }
                }

                if (pages.IsFinished) {
                    break;
                }

                const [advanceSuccess] = pcall(() => pages.AdvanceToNextPageAsync());
                if (!advanceSuccess) {
                    break;
                }
            }

            return listings;
        } catch (error) {
            warn("Error getting player active listings:", error);
            return [];
        }
    }

    /**
     * Uploads a trade token to external system for recovery.
     */
    private uploadTradeToken(tokenId: string, token: TradeToken) {
        if (this.tradeTokenWebhook === undefined) {
            return;
        }

        try {
            const payload = {
                tokenId: tokenId,
                token: token,
                timestamp: os.time(),
            };

            HttpService.PostAsync(
                this.tradeTokenWebhook,
                HttpService.JSONEncode(payload),
                Enum.HttpContentType.ApplicationJson,
            );
        } catch (error) {
            warn("Failed to upload trade token:", error);
        }
    }

    /**
     * Recovers interrupted trades on startup.
     */
    private recoverInterruptedTrades() {
        try {
            // Check for any processing tokens that need to be completed or rolled back
            // This would query the external webhook system for any unresolved tokens

            warn("Trade recovery system initialized");

            // Also recover expired listings and return items to sellers
            this.recoverExpiredListings();
        } catch (error) {
            warn("Error during trade recovery:", error);
        }
    }

    /**
     * Recovers expired listings on server startup and returns items to sellers.
     * This method loads seller profiles temporarily to return expired items.
     */
    private recoverExpiredListings() {
        task.spawn(() => {
            try {
                const currentTime = os.time();
                const expiredListingsBySeller = new Map<number, { uuid: string; listing: MarketplaceListing }[]>();

                warn("Starting expired listings recovery...");

                // Use ListKeysAsync to find all expired listings
                const [success, pages] = pcall(() => this.marketplaceDataStore.ListKeysAsync());

                if (!success || pages === undefined) {
                    warn("Failed to list marketplace keys for recovery:", pages);
                    return;
                }

                // First pass: collect all expired listings grouped by seller
                while (true) {
                    const keys = pages.GetCurrentPage();

                    for (const item of keys) {
                        const keyInfo = item as DataStoreKey;
                        const [getSuccess, result] = pcall(() => this.marketplaceDataStore.GetAsync(keyInfo.KeyName));

                        if (getSuccess && result !== undefined) {
                            const [listing] = result as LuaTuple<[MarketplaceListing | undefined]>;

                            if (listing !== undefined && listing.active && listing.expires !== undefined) {
                                // Check if listing has expired
                                if (listing.expires <= currentTime) {
                                    const sellerId = listing.sellerId;
                                    const sellerListings = expiredListingsBySeller.get(sellerId) ?? [];
                                    sellerListings.push({ uuid: keyInfo.KeyName, listing });
                                    expiredListingsBySeller.set(sellerId, sellerListings);
                                }
                            }
                        }
                    }

                    if (pages.IsFinished) {
                        break;
                    }

                    const [advanceSuccess] = pcall(() => pages.AdvanceToNextPageAsync());
                    if (!advanceSuccess) {
                        break;
                    }
                }

                if (expiredListingsBySeller.size() === 0) {
                    warn("No expired listings found during recovery");
                    return;
                }

                warn(`Found ${expiredListingsBySeller.size()} sellers with expired listings`);

                // Second pass: load each seller's profile and return their items
                for (const [sellerId, expiredListings] of expiredListingsBySeller) {
                    task.spawn(() => {
                        const [loadSuccess, sellerProfile] = pcall(() => {
                            // Load seller's empire profile using their seller empire ID
                            const sellerEmpireId = expiredListings[0].listing.sellerEmpireId;
                            return EmpireProfileManager.load(sellerEmpireId);
                        });

                        if (!loadSuccess || sellerProfile === undefined) {
                            warn(`Failed to load profile for seller ${sellerId}:`, sellerProfile);
                            return;
                        }

                        // Return all expired items to this seller
                        for (const { uuid, listing } of expiredListings) {
                            // Mark listing as inactive in DataStore
                            const [updateSuccess] = pcall(() => {
                                this.marketplaceDataStore.UpdateAsync(
                                    uuid,
                                    (oldListing: MarketplaceListing | undefined) => {
                                        if (oldListing === undefined || !oldListing.active) {
                                            return $tuple(oldListing);
                                        }

                                        // Mark as inactive
                                        const updatedListing = { ...oldListing, active: false };
                                        return $tuple(updatedListing);
                                    },
                                );
                            });

                            if (!updateSuccess) {
                                warn(`Failed to mark listing ${uuid} as inactive`);
                                continue;
                            }

                            // Restore item to seller's inventory
                            const listingUniqueItem = listing.uniqueItem;
                            if (listingUniqueItem !== undefined) {
                                const restoredPots = new Map<string, number>();
                                for (const [potName, potValue] of listingUniqueItem.pots) {
                                    restoredPots.set(potName, potValue);
                                }

                                const restoredUniqueItem: UniqueItemInstance = {
                                    baseItemId: listingUniqueItem.baseItemId,
                                    pots: restoredPots,
                                    created: listingUniqueItem.created,
                                };
                                if (listingUniqueItem.placed !== undefined) {
                                    restoredUniqueItem.placed = listingUniqueItem.placed;
                                }

                                sellerProfile.Data.items.uniqueInstances.set(uuid, restoredUniqueItem);
                                warn(`Returned expired item ${uuid} to seller ${sellerId}`);
                            } else {
                                warn(`Listing ${uuid} missing unique item data during recovery`);
                            }
                        }

                        // Unload the seller's profile to save changes
                        const [unloadSuccess] = pcall(() => {
                            EmpireProfileManager.unload(expiredListings[0].listing.sellerEmpireId);
                        });

                        if (!unloadSuccess) {
                            warn(`Failed to unload profile for seller ${sellerId}`);
                        } else {
                            warn(`Successfully recovered ${expiredListings.size()} items for seller ${sellerId}`);
                        }
                    });
                }

                warn("Expired listings recovery completed");
            } catch (error) {
                warn("Error during expired listings recovery:", error);
            }
        });
    }

    /**
     * Cleans up expired listings.
     * Note: This only marks listings as inactive. Item returns are handled by the recovery system
     * when sellers log in or during server startup via recoverExpiredListings().
     */
    private cleanupExpiredListings(): void {
        task.spawn(() => {
            try {
                const currentTime = os.time();
                const expiredListings: string[] = [];

                // Use ListKeysAsync to find expired listings
                const [success, pages] = pcall(() => this.marketplaceDataStore.ListKeysAsync());

                if (!success || pages === undefined) {
                    return;
                }

                while (true) {
                    const keys = pages.GetCurrentPage();

                    for (const item of keys) {
                        const keyInfo = item as DataStoreKey;
                        const [getSuccess, result] = pcall(() => this.marketplaceDataStore.GetAsync(keyInfo.KeyName));

                        if (getSuccess && result !== undefined) {
                            const [listing] = result as LuaTuple<[MarketplaceListing | undefined]>;

                            if (listing !== undefined && listing.active && listing.expires !== undefined) {
                                // Check if listing has expired
                                if (listing.expires <= currentTime) {
                                    expiredListings.push(keyInfo.KeyName);
                                }
                            }
                        }
                    }

                    if (pages.IsFinished) {
                        break;
                    }

                    const [advanceSuccess] = pcall(() => pages.AdvanceToNextPageAsync());
                    if (!advanceSuccess) {
                        break;
                    }
                }

                // Clean up expired listings
                for (const uuid of expiredListings) {
                    const [updateSuccess, result] = pcall(() => {
                        return this.marketplaceDataStore.UpdateAsync(
                            uuid,
                            (oldListing: MarketplaceListing | undefined) => {
                                if (oldListing === undefined || !oldListing.active) {
                                    return $tuple(oldListing);
                                }

                                // Mark as inactive
                                const updatedListing = { ...oldListing, active: false };
                                return $tuple(updatedListing);
                            },
                        );
                    });

                    if (updateSuccess && result !== undefined) {
                        const [actualListing] = result as unknown as LuaTuple<[MarketplaceListing | undefined]>;
                        if (actualListing !== undefined) {
                            this.listingCancelled.fire(uuid, actualListing.sellerId);

                            // Send listing removal to clients
                            Packets.listingRemoved.toAllClients(uuid);
                        }
                    }
                }

                if (expiredListings.size() > 0) {
                    this.refreshMarketplaceListings();
                }
            } catch (error) {
                warn("Error cleaning up expired listings:", error);
            }
        });
    }

    /**
     * Refreshes marketplace listings for all clients.
     */
    private refreshMarketplaceListings(): void {
        task.spawn(() => {
            try {
                const listings = this.getMarketplaceListings();
                const listingsMap = new Map<string, MarketplaceListing>();

                // Convert array to map keyed by UUID
                for (const listing of listings) {
                    listingsMap.set(listing.uuid, listing);
                }

                // Update the marketplace listings packet for all clients
                Packets.marketplaceListings.set(listingsMap);

                warn(`Refreshed marketplace with ${listings.size()} active listings`);
            } catch (error) {
                warn("Error refreshing marketplace listings:", error);
            }
        });
    }

    /**
     * Sends a webhook notification for a completed trade.
     */
    private sendTradeWebhook(transaction: MarketplaceTransaction): void {
        task.spawn(() => {
            try {
                const payload = {
                    type: "trade_completed",
                    transaction: transaction,
                    timestamp: os.time(),
                };

                if (this.tradeTokenWebhook !== undefined) {
                    HttpService.PostAsync(
                        this.tradeTokenWebhook,
                        HttpService.JSONEncode(payload),
                        Enum.HttpContentType.ApplicationJson,
                    );
                }
            } catch (error) {
                warn("Failed to send trade webhook:", error);
            }
        });
    }

    /**
     * Sets the trade token webhook URL (admin only).
     */
    setTradeTokenWebhook(webhookUrl: string): void {
        this.tradeTokenWebhook = webhookUrl;
    }
}
