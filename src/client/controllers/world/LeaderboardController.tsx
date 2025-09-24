import Signal from "@antivivi/lemon-signal";
import { observeTag } from "@antivivi/vrldk";
import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import { createRoot, Root } from "@rbxts/react-roblox";
import LiveLeaderboard from "client/ui/components/leaderboard/LiveLeaderboard";
import { playSound } from "shared/asset/GameAssets";
import { DONATION_PRODUCTS } from "shared/devproducts/DonationProducts";
import Packets from "shared/Packets";

type DonationPart = Part & {
    SurfaceGui: SurfaceGui & {
        Display: ScrollingFrame;
    };
};

@Controller()
export class LeaderboardController implements OnStart, LeaderboardDataManager {
    private leaderboardData = new Map<LeaderboardType, LeaderboardEntry[]>();
    private leaderboardDataChanged = new Signal<(type: LeaderboardType, entries: LeaderboardEntry[]) => void>();

    getLeaderboardEntries(leaderboardType: LeaderboardType): LeaderboardEntry[] {
        return Packets.leaderboardData.get()?.get(leaderboardType) ?? [];
    }

    onLeaderboardUpdate(leaderboardType: LeaderboardType, callback: (entries: LeaderboardEntry[]) => void): () => void {
        const connection = this.leaderboardDataChanged.connect((changedType, entries) => {
            if (leaderboardType === changedType) {
                callback(entries);
            }
        });
        return () => {
            connection.disconnect();
        };
    }

    /**
     * Sets up the click event for each donation button.
     * When a button is clicked, it prompts the user to donate the corresponding amount.
     *
     * @param donationOption The TextButton representing the donation option.
     */
    setupDonationButton(donationOption: TextButton) {
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
        const ROOTS_PER_LEADERBOARD = new Map<Instance, Root>();
        observeTag(
            "Leaderboard",
            (leaderboard) => {
                const guiPart = leaderboard.WaitForChild("GuiPart") as BasePart;
                const surfaceGui = new Instance("SurfaceGui");
                surfaceGui.Parent = guiPart;
                task.spawn(() => {
                    const root = createRoot(surfaceGui);
                    root.render(
                        <LiveLeaderboard dataManager={this} leaderboardType={leaderboard.Name as LeaderboardType} />,
                    );
                    ROOTS_PER_LEADERBOARD.set(leaderboard, root);
                });
                if (leaderboard.Name === "Donated") {
                    const donationPart = leaderboard.WaitForChild("DonationPart") as DonationPart;
                    for (const donationOption of donationPart.SurfaceGui.Display.GetChildren()) {
                        if (!donationOption.IsA("TextButton")) continue;
                        this.setupDonationButton(donationOption as TextButton);
                    }
                }
            },
            (leaderboard) => {
                const root = ROOTS_PER_LEADERBOARD.get(leaderboard);
                if (root) {
                    root.unmount();
                    ROOTS_PER_LEADERBOARD.delete(leaderboard);
                }
            },
        );

        Packets.leaderboardData.observe((leaderboardData) => {
            for (const [type, entries] of leaderboardData) {
                if (entries !== this.leaderboardData.get(type)) {
                    this.leaderboardDataChanged.fire(type, entries);
                }
            }
            this.leaderboardData = leaderboardData;
        });
    }
}
