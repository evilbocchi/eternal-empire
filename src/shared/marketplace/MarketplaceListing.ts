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
         * The empire ID where the item is being sold from.
         */
        sellerEmpireId: string;

        /**
         * The asking price for the item.
         */
        price: number;

        /**
         * Unix timestamp when the listing was created.
         */
        created: DataType.f64;

        /**
         * Unique item instance data associated with this listing, including raw pot values.
         */
        uniqueItem: DataType.Packed<UniqueItemInstance>;

        /**
         * The empire ID of the buyer that is in the process of buying this listing (if any).
         */
        lock?: string;

        /**
         * Unix timestamp when the listing was locked for purchase (if any).
         */
        lockedAt?: DataType.f64;

        /**
         * Whether the item has been bought and finalized.
         */
        bought: boolean;
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
         * The empire ID of the buyer.
         */
        buyerEmpireId: string;

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
        timestamp: DataType.f64;

        /**
         * Current status of the trade.
         */
        status: "processing" | "completed" | "failed" | "rolled_back";
    }

    /**
     * Marketplace transaction history entry.
     */
    interface MarketplaceTransaction {
        /**
         * The UUID of the item that was traded.
         */
        uuid: string;

        /**
         * The base item ID for reference.
         */
        baseItemId: string;

        /**
         * The empire ID of the buyer.
         */
        buyerEmpireId: string;

        /**
         * The empire ID of the seller.
         */
        sellerEmpireId: string;

        /**
         * The final sale price.
         */
        price: number;

        /**
         * Unix timestamp of the transaction.
         */
        timestamp: DataType.f64;
    }
}

/**
 * Marketplace configuration constants.
 */
const MARKETPLACE_CONFIG = {
    /** Whether the marketplace is enabled */
    ENABLED: true,

    /** Time in seconds before a listing lock expires */
    LOCK_TIMEOUT: 5 * 60, // 5 minutes

    /** Maximum number of active listings per empire */
    MAX_LISTINGS_PER_EMPIRE: 5,

    /** Default listing duration in seconds (7 days) */
    LISTING_DURATION: 7 * 24 * 60 * 60,

    /** Transaction tax percentage (2%) */
    TRANSACTION_TAX_PERCENTAGE: 0.02,

    /** Maximum price for any listing */
    MAX_LISTING_PRICE: 1e12,

    /** Minimum price for any listing */
    MIN_LISTING_PRICE: 1,

    /**
     * DataStore where actual marketplace listings are stored.
     * Keys: {@link MarketplaceListing.uuid}
     * Values: {@link MarketplaceListing}
     */
    DATASTORE_NAME: "MarketplaceListings",

    /**
     * DataStore where listings can be searched.
     * Keys: 0-indexed integers
     * Values: {@link MarketplaceListing[]} (array of listings)
     */
    INDEX_DATASTORE_NAME: "MarketplaceIndex",

    /**
     * DataStore where transaction history of unique instances are stored.
     * Keys: {@link MarketplaceTransaction.uuid}
     * Values: {@link MarketplaceTransaction[]} (array of transactions)
     */
    HISTORY_DATASTORE_NAME: "MarketplaceHistory",
} as const;

export = MARKETPLACE_CONFIG;
