/**
 * @fileoverview Tracks and updates player donation stats.
 *
 * This service provides:
 * - Getting and setting the amount a player has donated
 * - Synchronizing donation stats with leaderboards
 *
 * @since 1.0.0
 */

import { OnStart, Service } from "@flamework/core";
import { MarketplaceService, MessagingService } from "@rbxts/services";
import { OnPlayerAdded } from "server/services/ModdingService";
import ChatHookService from "server/services/permissions/ChatHookService";
import ProductService from "server/services/product/ProductService";
import Packets from "shared/Packets";
import Leaderstats from "shared/data/Leaderstats";
import { PlayerProfileManager } from "shared/data/profile/ProfileManager";
import { DONATION_PRODUCTS } from "shared/devproducts/DonationProducts";

/**
 * Service that manages player donation stats and leaderboard updates.
 */
@Service()
export class DonationService implements OnStart, OnPlayerAdded {
    constructor(
        private chatHookService: ChatHookService,
        private productService: ProductService,
    ) {}

    /**
     * Gets the amount a player has donated.
     *
     * @param player The player to check.
     */
    getDonated(player: Player) {
        return PlayerProfileManager.load(player.UserId, true)?.Data.donated ?? 0;
    }

    /**
     * Sets the amount a player has donated.
     *
     * @param player The player to update.
     * @param donated The new donation amount.
     */
    setDonated(player: Player, donated: number) {
        const playerProfile = PlayerProfileManager.load(player.UserId);
        if (playerProfile !== undefined) {
            playerProfile.Data.donated = donated;
            this.updateLeaderstats(player, donated);
        }
    }

    updateLeaderstats(player: Player, donated = this.getDonated(player)) {
        Leaderstats.setLeaderstat(player, "Donated", donated);
    }

    onPlayerAdded(player: Player) {
        this.updateLeaderstats(player);
    }

    onStart() {
        MessagingService.SubscribeAsync("Donation", (message) => {
            Packets.donationGiven.toAllClients();
            this.chatHookService.sendServerMessage(message.Data as string, "color:3,207,252");
        });

        Packets.promptDonation.fromClient((player, dp) => MarketplaceService.PromptProductPurchase(player, dp));
        for (const donationProduct of DONATION_PRODUCTS) {
            this.productService.setProductFunction(donationProduct.id, (_receipt, player) => {
                this.setDonated(player, this.getDonated(player) + donationProduct.amount);
                this.chatHookService.sendServerMessage(
                    player.Name + " JUST DONATED " + donationProduct.amount + " ROBUX!",
                );
                if (donationProduct.amount >= 100) {
                    MessagingService.PublishAsync(
                        "Donation",
                        player.Name + " JUST DONATED " + donationProduct.amount + " ROBUX!!!",
                    );
                }
                return Enum.ProductPurchaseDecision.PurchaseGranted;
            });
        }
    }
}
