/**
 * @fileoverview Handles Roblox developer product purchases and processing.
 *
 * This service:
 * - Registers product purchase handlers for specific product IDs
 * - Processes receipts and delegates to the correct handler
 * - Ensures product purchases are handled securely and robustly
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import { MarketplaceService, Players } from "@rbxts/services";

/**
 * Service that manages developer product purchase handling.
 */
@Service()
export default class ProductService implements OnInit {
    /**
     * Map of product IDs to their purchase handling functions.
     */
    readonly productFunctions = new Map<number, ProductFunction>();

    /**
     * Registers a function to handle purchases for a specific product ID.
     *
     * @param productID The Roblox product ID to handle.
     * @param productFunction The function to call when this product is purchased.
     */
    setProductFunction(productID: number, productFunction: ProductFunction) {
        this.productFunctions.set(productID, productFunction);
    }

    /**
     * Initializes the product service and sets up receipt processing.
     */
    onInit() {
        // Set up product purchase processing
        MarketplaceService.ProcessReceipt = (receiptInfo: ReceiptInfo) => {
            const productFunction = this.productFunctions.get(receiptInfo.ProductId);
            const player = Players.GetPlayerByUserId(receiptInfo.PlayerId);
            if (productFunction === undefined || player === undefined) {
                print(receiptInfo);
                return Enum.ProductPurchaseDecision.NotProcessedYet;
            }
            return productFunction(receiptInfo, player);
        };
    }
}
