import React, { Fragment, useEffect, useState } from "@rbxts/react";
import Leaderboard, { LeaderboardType } from "client/components/world/leaderboard/Leaderboard";
import useProperty from "client/hooks/useProperty";
import { playSound } from "shared/asset/GameAssets";
import { DONATION_PRODUCTS } from "shared/devproducts/DonationProducts";
import Packets from "shared/Packets";
import WorldNode from "shared/world/nodes/WorldNode";

type DonationPart = Part & {
    SurfaceGui: SurfaceGui & {
        Display: ScrollingFrame;
    };
};

/**
 * Sets up the click event for each donation button.
 * When a button is clicked, it prompts the user to donate the corresponding amount.
 *
 * @param donationOption The TextButton representing the donation option.
 */
function setupDonationButton(donationOption: TextButton) {
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

export default function LeaderboardRenderer() {
    const [guiParts, setGuiParts] = useState<Map<Instance, BasePart>>(new Map());
    const leaderboardData = useProperty(Packets.leaderboardData);

    useEffect(() => {
        let guiParts = new Map<Instance, BasePart>();

        const leaderboardNode = new WorldNode<Model>("Leaderboard", (instance) => {
            const guiPart = instance.WaitForChild("GuiPart") as BasePart;
            guiParts.set(instance, guiPart);
            setGuiParts(table.clone(guiParts));
            if (instance.Name === "Donated") {
                const donationPart = instance.WaitForChild("DonationPart") as DonationPart;
                for (const donationOption of donationPart.SurfaceGui.Display.GetChildren()) {
                    if (!donationOption.IsA("TextButton")) continue;
                    setupDonationButton(donationOption as TextButton);
                }
            }
        });

        return () => {
            leaderboardNode.cleanup();
        };
    }, []);

    const elements = new Array<JSX.Element>();
    for (const [instance, guiPart] of guiParts) {
        const leaderboardEntries = leaderboardData.get(instance.Name as LeaderboardType);

        if (leaderboardEntries === undefined) continue;

        elements.push(
            <surfacegui
                Adornee={guiPart}
                LightInfluence={0}
                MaxDistance={200}
                ResetOnSpawn={false}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior="Sibling"
            >
                <Leaderboard leaderboardType={instance.Name as LeaderboardType} entries={leaderboardEntries} />
            </surfacegui>,
        );
    }

    return <Fragment>{elements}</Fragment>;
}
