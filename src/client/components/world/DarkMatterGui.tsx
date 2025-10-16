import { OnoeNum } from "@rbxts/serikanum";
import React, { Fragment, useEffect, useState } from "@rbxts/react";
import { RobotoSlabBold, RobotoSlabHeavy } from "shared/asset/GameFonts";
import DarkMatter from "shared/currency/mechanics/DarkMatter";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import DarkMatterPart from "shared/world/nodes/DarkMatterPart";

function calculateDetails(balance: BaseCurrencyMap) {
    const [boost, darkMatter] = DarkMatter.getBoost(balance);
    return { amount: darkMatter, boost };
}

export default function DarkMatterGui() {
    const [{ boost, amount }, setDetails] = useState<ReturnType<typeof calculateDetails>>(
        calculateDetails(Packets.balance.get()),
    );

    useEffect(() => {
        const connection = Packets.balance.observe((newBalance) => {
            setDetails(calculateDetails(newBalance));
        });
        return () => connection.disconnect();
    }, []);

    const remainingForPower = DarkMatter.BOOSTING_CURRENCIES.Power.requirement.sub(amount ?? 0);
    const powerLocked = remainingForPower.moreThan(0);

    return (
        <surfacegui
            Adornee={DarkMatterPart.waitForInstance()}
            ClipsDescendants={true}
            LightInfluence={1}
            MaxDistance={300}
            ResetOnSpawn={false}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 15)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <uipadding PaddingLeft={new UDim(0, 25)} PaddingRight={new UDim(0, 25)} PaddingTop={new UDim(0, 25)} />
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Size={new UDim2(1, 0, 0, 0)}
                Text="You have"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={100}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                LayoutOrder={4}
                Size={new UDim2(1, 0, 0, 0)}
                Text="Dark Matter, boosting gain by"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={80}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <uipadding PaddingBottom={new UDim(0, 20)} />
            </textlabel>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                LayoutOrder={2}
                Size={new UDim2(0.5, 0, 0, 100)}
                Text={OnoeNum.toString(amount ?? 0)}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={100}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 170, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(170, 85, 255)),
                        ])
                    }
                    Rotation={90}
                />
                <uiscale Scale={2} />
            </textlabel>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                LayoutOrder={4}
                Size={new UDim2(0.5, 0, 0.09, 0)}
                Text={`x${boost?.get("Funds")?.toString() ?? "1"} Funds`}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={70}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 127)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(170, 255, 127)),
                        ])
                    }
                    Rotation={90}
                />
                <uiscale Scale={2} />
            </textlabel>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                LayoutOrder={5}
                Size={new UDim2(0.5, 0, 0, powerLocked ? 50 : 70)}
                Text={
                    powerLocked
                        ? `(${remainingForPower.toString()} more to unlock!)`
                        : `x${boost?.get("Power")?.toString() ?? "1"} Power`
                }
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={powerLocked ? 50 : 70}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 170, 0)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 136, 0)),
                        ])
                    }
                    Rotation={90}
                />
                <uiscale Scale={2} />
            </textlabel>
        </surfacegui>
    );
}
