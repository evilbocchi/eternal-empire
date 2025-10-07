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
import { IS_EDIT } from "shared/Context";
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
     * Increases the donated amount for a player by a delta.
     *
     * @param player The player to update.
     * @param delta The amount to increase the donation by.
     */
    incrementDonated(player: Player, delta: number) {
        const playerProfile = PlayerProfileManager.load(player.UserId);
        if (playerProfile !== undefined) {
            const newDonated = playerProfile.Data.donated + delta;
            playerProfile.Data.donated = newDonated;
            Leaderstats.setLeaderstat(player, "Donated", newDonated);
        }
    }

    onPlayerAdded(player: Player) {
        const playerProfile = PlayerProfileManager.load(player.UserId);
        if (playerProfile !== undefined) {
            Leaderstats.setLeaderstat(player, "Donated", playerProfile.Data.donated);
        }
    }

    onStart() {
        if (!IS_EDIT) {
            MessagingService.SubscribeAsync("Donation", (message) => {
                Packets.donationGiven.toAllClients();
                this.chatHookService.sendServerMessage(message.Data as string, "color:3,207,252");
            });
        }

        Packets.promptDonation.fromClient((player, dp) => MarketplaceService.PromptProductPurchase(player, dp));
        for (const donationProduct of DONATION_PRODUCTS) {
            this.productService.setProductFunction(donationProduct.id, (_receipt, player) => {
                this.incrementDonated(player, donationProduct.amount);
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
