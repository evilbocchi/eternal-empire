import { OnInit, Service } from "@flamework/core";
import { MarketplaceService, Players } from "@rbxts/services";

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