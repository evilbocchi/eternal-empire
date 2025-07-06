import { Flamework } from "@flamework/core";
import { getSound } from "shared/asset/GameAssets";
import { LEADERBOARDS } from "shared/constants";
import { DONATION_PRODUCTS } from "shared/devproducts/DonationProducts";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

Flamework.addPaths("src/client/controllers");
Flamework.ignite();

if (!Sandbox.getEnabled()) {
    const clickSound = getSound("MenuClick.mp3").Clone();
    clickSound.Parent = LEADERBOARDS.Donated.DonationPart;
    for (const donationOption of LEADERBOARDS.Donated.DonationPart.SurfaceGui.Display.GetChildren()) {
        if (donationOption.IsA("TextButton")) {
            const amount = donationOption.LayoutOrder;
            let donationProduct = 0;
            for (const dp of DONATION_PRODUCTS) {
                if (dp.amount === amount) {
                    donationProduct = dp.id;
                }
            }
            donationOption.MouseButton1Click.Connect(() => {
                clickSound.Play();
                Packets.promptDonation.inform(donationProduct);
            });
        }
    }
}
