//!native
//!optimize 2

/**
 * @fileoverview Simplified marketplace service for demonstration.
 * 
 * This is a simplified version to show the marketplace concept
 * and basic functionality without complex error handling.
 * 
 * @since 1.0.0
 */

import { Service } from "@flamework/core";
import { DataStoreService } from "@rbxts/services";
import CurrencyService from "server/services/serverdata/CurrencyService";
import DataService from "server/services/serverdata/DataService";

/**
 * Simplified marketplace service for proof of concept.
 */
@Service()
export default class SimpleMarketplaceService {

    private marketplaceDataStore = DataStoreService.GetDataStore("SimpleMarketplace");
    
    constructor(
        private currencyService: CurrencyService,
        private dataService: DataService
    ) {}

    /**
     * Creates a simple listing (demo version).
     */
    createSimpleListing(itemUuid: string, price: number): boolean {
        try {
            // Basic validation
            if (price <= 0) {
                return false;
            }

            // Store in DataStore
            this.marketplaceDataStore.SetAsync(itemUuid, {
                uuid: itemUuid,
                price: price,
                created: os.time(),
                active: true
            });

            print(`Created marketplace listing for ${itemUuid} at price ${price}`);
            return true;
        } catch (error) {
            warn("Failed to create listing:", error);
            return false;
        }
    }

    /**
     * Gets a listing (demo version).
     */
    getListing(itemUuid: string): Record<string, unknown> | undefined {
        try {
            const [listing] = this.marketplaceDataStore.GetAsync(itemUuid);
            return listing as Record<string, unknown> | undefined;
        } catch (error) {
            warn("Failed to get listing:", error);
            return undefined;
        }
    }

    /**
     * Cancels a listing (demo version).
     */
    cancelListing(itemUuid: string): boolean {
        try {
            this.marketplaceDataStore.RemoveAsync(itemUuid);
            print(`Cancelled listing for ${itemUuid}`);
            return true;
        } catch (error) {
            warn("Failed to cancel listing:", error);
            return false;
        }
    }

    /**
     * Simple buy operation (demo version).
     */
    buyItem(itemUuid: string, buyerUserId: number): boolean {
        try {
            const listing = this.getListing(itemUuid);
            if (!listing || !listing.active) {
                return false;
            }

            // Check if player has funds (simplified)
            const currentFunds = this.currencyService.get("Funds");
            const price = listing.price as number;
            
            if (currentFunds.lessThan(price)) {
                print("Insufficient funds");
                return false;
            }

            // Process purchase
            this.currencyService.set("Funds", currentFunds.sub(price));
            this.marketplaceDataStore.RemoveAsync(itemUuid);
            
            print(`Item ${itemUuid} sold to user ${buyerUserId} for ${price}`);
            return true;
        } catch (error) {
            warn("Failed to buy item:", error);
            return false;
        }
    }

    /**
     * Admin command to test marketplace.
     */
    testMarketplace(): void {
        print("=== MARKETPLACE TEST ===");
        
        // Test creating a listing
        const testUuid = "test-item-12345";
        const success = this.createSimpleListing(testUuid, 1000);
        print("Create listing:", success);
        
        // Test getting the listing
        const listing = this.getListing(testUuid);
        print("Get listing:", listing);
        
        // Test cancelling
        const cancelled = this.cancelListing(testUuid);
        print("Cancel listing:", cancelled);
        
        print("=== TEST COMPLETE ===");
    }
}