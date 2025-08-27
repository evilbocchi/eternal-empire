/**
 * @fileoverview Handles the donation UI and interactions in the game.
 * 
 * This controller initializes donation options, sets up click events for donation buttons,
 * and manages the donation process by prompting the user to donate specific amounts.
 * 
 * @since 1.0.0
 */

import { Controller, OnStart } from "@flamework/core";
import UIController from "client/controllers/core/UIController";
import { playSound } from "shared/asset/GameAssets";
import { LEADERBOARDS } from "shared/constants";
import { DONATION_PRODUCTS } from "shared/devproducts/DonationProducts";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

/**
 * Controller for handling donations in the game.
 * This controller initializes the donation options and sets up click events for each donation button.
 */
@Controller()
export default class DonationController implements OnStart {

    constructor(private uiController: UIController) {

    }

    /**
     * Sets up the click event for each donation button.
     * When a button is clicked, it prompts the user to donate the corresponding amount.
     * 
     * @param donationOption The TextButton representing the donation option.
     * @param productId The ID of the product to be purchased when the button is clicked.
     */
    setupDonationButton(donationOption: TextButton, productId: number) {
        const amount = donationOption.LayoutOrder;
        let donationProduct = 0;
        for (const dp of DONATION_PRODUCTS) {
            if (dp.amount === amount) {
                donationProduct = dp.id;
            }
        }
        donationOption.MouseButton1Click.Connect(() => {
            playSound("MenuClick.mp3");
            Packets.promptDonation.toServer(donationProduct);
        });
    }

    onStart() {
        if (Sandbox.getEnabled())
            return;

        for (const donationOption of LEADERBOARDS.Donated.DonationPart.SurfaceGui.Display.GetChildren()) {
            if (!donationOption.IsA("TextButton"))
                continue;
            this.setupDonationButton(donationOption as TextButton, DONATION_PRODUCTS[donationOption.LayoutOrder - 1]?.id || 0);
        }
    }
}