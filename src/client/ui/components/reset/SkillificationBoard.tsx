import Difficulty from "@antivivi/jjt-difficulties";
import React, { useState } from "@rbxts/react";
import { RobotoSlabBold, RobotoSlabHeavy } from "client/ui/GameFonts";

export default function SkillificationBoard() {
    const [amountLabel, setAmountLabel] = useState("0 Skill");

    return (
        <imagelabel
            BackgroundTransparency={1}
            Image={`rbxassetid://${Difficulty.TheFirstDifficulty.image}`}
            ImageTransparency={0.9}
            ScaleType={Enum.ScaleType.Crop}
            Size={new UDim2(1, 0, 1, 0)}
        >
            <uipadding
                PaddingBottom={new UDim(0, 5)}
                PaddingLeft={new UDim(0, 5)}
                PaddingRight={new UDim(0, 5)}
                PaddingTop={new UDim(0, 5)}
            >
                <uipadding
                    PaddingBottom={new UDim(0, 5)}
                    PaddingLeft={new UDim(0, 5)}
                    PaddingRight={new UDim(0, 5)}
                    PaddingTop={new UDim(0, 5)}
                />
            </uipadding>
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={3} />
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    LayoutOrder={99}
                    Size={new UDim2(0.45, 0, 0.1, 0)}
                    Text={amountLabel}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={80}
                    TextStrokeTransparency={0}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Right}
                >
                    <uistroke Thickness={2} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 127)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(105, 255, 122)),
                            ])
                        }
                        Rotation={90}
                    />
                    <textlabel
                        AnchorPoint={new Vector2(0, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={5}
                        Position={new UDim2(0, 0, 0.5, 0)}
                        Size={new UDim2(0.45, 0, 0.9, 0)}
                        Text="Reset now for:"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={25}
                        TextStrokeTransparency={0}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>
                    <uiscale Scale={2} />
                </textlabel>
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    Size={new UDim2(0.5, 0, 0.125, 0)}
                    Text="Skillification"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={100}
                    TextWrapped={true}
                >
                    <uiscale Scale={2} />
                    <uistroke Thickness={2} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 127)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(69, 255, 116)),
                            ])
                        }
                        Rotation={90}
                    />
                </textlabel>
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                <frame BackgroundTransparency={1} LayoutOrder={4} Size={new UDim2(1, 0, 0.5, 0)}>
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={4}
                        Size={new UDim2(0.9, 0, 0, 0)}
                        Text="The world begs for more as you continue expanding your empire, continuously breaking your own limits."
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={75}
                        TextStrokeTransparency={0}
                        TextWrapped={true}
                        TextYAlignment={Enum.TextYAlignment.Top}
                    >
                        <uistroke Thickness={3} />
                    </textlabel>
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={5}
                        Size={new UDim2(0.9, 0, 0, 0)}
                        Text="Your items, balance, everything that led you this far — sacrifice it all."
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={75}
                        TextStrokeTransparency={0}
                        TextWrapped={true}
                        TextYAlignment={Enum.TextYAlignment.Top}
                    >
                        <uistroke Thickness={3} />
                    </textlabel>
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={6}
                        Size={new UDim2(0.9, 0, 0, 0)}
                        Text="In return, gain Skill, a new currency that can be spent to unlock items and boosts to massively speed up progression."
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={75}
                        TextStrokeTransparency={0}
                        TextWrapped={true}
                        TextYAlignment={Enum.TextYAlignment.Top}
                    >
                        <uistroke Thickness={3} />
                    </textlabel>
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalFlex={Enum.UIFlexAlignment.SpaceBetween}
                    />
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={6}
                        Size={new UDim2(0.9, 0, 0, 0)}
                        Text="Note that this reset layer does not reset any progression past Barren Islands and quests. "
                        TextColor3={Color3.fromRGB(186, 186, 186)}
                        TextSize={50}
                        TextStrokeTransparency={0}
                        TextWrapped={true}
                        TextYAlignment={Enum.TextYAlignment.Top}
                    >
                        <uistroke Thickness={3} />
                    </textlabel>
                </frame>
            </frame>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
        </imagelabel>
    );
}
