/**
 * @fileoverview Marketplace listing data structures and types.
 *
 * This module defines the core data structures used in the marketplace system
 * for managing item listings, auctions, and trade information.
 *
 * @since 1.0.0
 */

import { DataType } from "@rbxts/flamework-binary-serializer";

declare global {
    /**
     * Represents a marketplace listing for a unique item.
     */
    interface MarketplaceListing {
        /**
         * The UUID of the unique item being sold.
         */
        uuid: string;

        /**
         * The user ID of the player listing the item.
         */
        sellerId: DataType.i32;

        /**
         * The empire ID where the item is being sold from.
         */
        sellerEmpireId: string;

        /**
         * The asking price for the item.
         */
        price: number;

        /**
         * The type of listing.
         */
        listingType: "buyout" | "auction";

        /**
         * Unix timestamp when the listing was created.
         */
        created: DataType.i32;

        /**
         * Unix timestamp when the listing expires (optional for auto-expiry).
         */
        expires?: DataType.i32;

        /**
         * Current highest bid for auction listings.
         */
        currentBid?: number;

        /**
         * User ID of the current highest bidder.
         */
        currentBidderId?: DataType.i32;

        /**
         * Empire ID of the current highest bidder.
         */
        currentBidderEmpireId?: string;

        /**
         * Listing fee paid (for potential refunds).
         */
        listingFee?: number;

        /**
         * Whether the listing is active.
         */
        active: boolean;
    }

    /**
     * External trade token for crash recovery.
     */
    interface TradeToken {
        /**
         * The UUID of the item being traded.
         */
        uuid: string;

        /**
         * The empire key for recovery identification.
         */
        empireKey: string;

        /**
         * The user ID of the buyer.
         */
        buyerId: DataType.i32;

        /**
         * The empire ID of the buyer.
         */
        buyerEmpireId: string;

        /**
         * The user ID of the seller.
         */
        sellerId: DataType.i32;

        /**
         * The empire ID of the seller.
         */
        sellerEmpireId: string;

        /**
         * The agreed upon price.
         */
        price: number;

        /**
         * Unix timestamp when the trade was initiated.
         */
        timestamp: DataType.i32;

        /**
         * Current status of the trade.
         */
        status: "processing" | "completed" | "failed" | "rolled_back";
    }

    /**
     * Marketplace search filters.
     */
    interface MarketplaceFilters {
        /**
         * Item name or ID to search for.
         */
        search?: string;

        /**
         * Minimum price filter.
         */
        minPrice?: number;

        /**
         * Maximum price filter.
         */
        maxPrice?: number;

        /**
         * Listing type filter.
         */
        listingType?: "buyout" | "auction" | "all";

        /**
         * Sort order.
         */
        sortBy?: "price_asc" | "price_desc" | "created_asc" | "created_desc";

        /**
         * Base item ID filter.
         */
        baseItemId?: string;
    }

    /**
     * Marketplace transaction history entry.
     */
    interface MarketplaceTransaction {
        /**
         * Unique transaction ID.
         */
        id: string;

        /**
         * The UUID of the item that was traded.
         */
        uuid: string;

        /**
         * The base item ID for reference.
         */
        baseItemId: string;

        /**
         * The seller's user ID.
         */
        sellerId: DataType.i32;

        /**
         * The buyer's user ID.
         */
        buyerId: DataType.i32;

        /**
         * The final sale price.
         */
        price: number;

        /**
         * Unix timestamp of the transaction.
         */
        timestamp: DataType.i32;

        /**
         * Type of transaction.
         */
        type: "buyout" | "auction_win";
    }
}

/**
 * Marketplace configuration constants.
 */
const MARKETPLACE_CONFIG = {
    /** Maximum number of active listings per player */
    MAX_LISTINGS_PER_PLAYER: 10,

    /** Default listing duration in seconds (7 days) */
    DEFAULT_LISTING_DURATION: 7 * 24 * 60 * 60,

    /** Marketplace listing fee percentage (1%) */
    LISTING_FEE_PERCENTAGE: 0.01,

    /** Transaction tax percentage (2%) */
    TRANSACTION_TAX_PERCENTAGE: 0.02,

    /** Maximum price for any listing */
    MAX_LISTING_PRICE: 1e12,

    /** Minimum price for any listing */
    MIN_LISTING_PRICE: 1,

    /** Time before processing tokens expire (1 hour) */
    PROCESSING_TOKEN_TIMEOUT: 60 * 60,

    /** Marketplace DataStore name */
    DATASTORE_NAME: "MarketplaceListings",

    /** Trade tokens DataStore name */
    TOKENS_DATASTORE_NAME: "TradeTokens",

    /** Transaction history DataStore name */
    HISTORY_DATASTORE_NAME: "MarketplaceHistory",
} as const;

export = MARKETPLACE_CONFIG;
