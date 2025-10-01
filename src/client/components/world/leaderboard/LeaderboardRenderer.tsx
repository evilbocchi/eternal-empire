import React, { Fragment, useEffect, useState } from "@rbxts/react";
import Shaker from "client/components/effect/Shaker";
import Leaderboard, { LeaderboardType } from "client/components/world/leaderboard/Leaderboard";
import useProperty from "client/hooks/useProperty";
import { playSound } from "shared/asset/GameAssets";
import { RobotoSlabExtraBold, RobotoSlabHeavy } from "shared/asset/GameFonts";
import { DONATION_PRODUCTS } from "shared/devproducts/DonationProducts";
import Packets from "shared/Packets";
import WorldNode, { SingleWorldNode } from "shared/world/nodes/WorldNode";

const DonationGuiPart = new SingleWorldNode<Part>("DonationGuiPart");

export default function LeaderboardRenderer() {
    const [guiParts, setGuiParts] = useState<Map<Instance, BasePart>>(new Map());
    const leaderboardData = useProperty(Packets.leaderboardData);

    useEffect(() => {
        let guiParts = new Map<Instance, BasePart>();

        const leaderboardNode = new WorldNode<Model>(
            "Leaderboard",
            (instance) => {
                const guiPart = instance.WaitForChild("GuiPart") as BasePart;
                guiParts.set(instance, guiPart);
                setGuiParts(table.clone(guiParts));
            },
            (instance) => {
                guiParts.delete(instance);
            },
        );

        const connection = Packets.donationGiven.fromServer(() => {
            playSound("PowerUp.mp3");
            Shaker.shake();
        });

        return () => {
            connection.Disconnect();
            leaderboardNode.cleanup();
        };
    }, []);

    const elements = new Array<JSX.Element>();
    for (const [instance, guiPart] of guiParts) {
        const leaderboardEntries = leaderboardData.get(instance.Name as LeaderboardType) ?? [];
        elements.push(
            <surfacegui
                Adornee={guiPart}
                LightInfluence={0}
                MaxDistance={50}
                ResetOnSpawn={false}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior="Sibling"
            >
                <Leaderboard leaderboardType={instance.Name as LeaderboardType} entries={leaderboardEntries} />
            </surfacegui>,
        );
    }

    return (
        <Fragment>
            <surfacegui
                Adornee={DonationGuiPart.waitForInstance()}
                ClipsDescendants={true}
                LightInfluence={1}
                MaxDistance={50}
                ResetOnSpawn={false}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    Position={new UDim2(0, 0, 0.02, 0)}
                    Size={new UDim2(1, 0, 0.15, 0)}
                    Text="Thanks for supporting  <3"
                    TextColor3={Color3.fromRGB(255, 85, 127)}
                    TextScaled={true}
                    TextSize={36}
                    TextWrapped={true}
                />
                <scrollingframe
                    Active={true}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundColor3={Color3.fromRGB(209, 209, 209)}
                    BorderSizePixel={0}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    Position={new UDim2(0.1, 0, 0.22, 0)}
                    Selectable={false}
                    Size={new UDim2(0.8, 0, 0.7, 0)}
                >
                    <uilistlayout Padding={new UDim(0, 5)} SortOrder={Enum.SortOrder.LayoutOrder}>
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Horizontal}
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            Padding={new UDim(0, 5)}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                        />
                    </uilistlayout>
                    <uipadding
                        PaddingBottom={new UDim(0, 15)}
                        PaddingLeft={new UDim(0, 15)}
                        PaddingRight={new UDim(0, 15)}
                        PaddingTop={new UDim(0, 15)}
                    />
                    {DONATION_PRODUCTS.map((dp) => (
                        <DonationOption key={`donation-${dp.id}`} amount={dp.amount} />
                    ))}
                </scrollingframe>
            </surfacegui>
            {elements}
        </Fragment>
    );
}

function DonationOption({ amount }: { amount: number }) {
    return (
        <textbutton
            BackgroundColor3={Color3.fromRGB(255, 255, 255)}
            BorderSizePixel={0}
            LayoutOrder={5}
            Selectable={false}
            Size={new UDim2(1, 0, 0, 40)}
            Text={""}
            Event={{
                Activated: () => {
                    let donationProduct = 0;
                    for (const dp of DONATION_PRODUCTS) {
                        if (dp.amount === amount) {
                            donationProduct = dp.id;
                        }
                    }
                    if (donationProduct === 0) {
                        warn(`No donation product found for amount: ${amount}`);
                        return;
                    }

                    playSound("MenuClick.mp3");
                    Packets.promptDonation.toServer(donationProduct);
                },
            }}
        >
            <uicorner CornerRadius={new UDim(0, 9)} />
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 5)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <uipadding PaddingLeft={new UDim(0, 6)} PaddingRight={new UDim(0, 6)} />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabExtraBold}
                Position={new UDim2(0.15, 0, 0, 0)}
                Size={new UDim2(0.65, 0, 0.9, 0)}
                Text={`Donate ${amount} Robux`}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextScaled={true}
                TextSize={14}
                TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
                TextStrokeTransparency={0.9}
                TextWrapped={true}
            />
        </textbutton>
    );
}
