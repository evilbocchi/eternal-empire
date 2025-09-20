import Difficulty from "@antivivi/jjt-difficulties";
import React, { Fragment } from "@rbxts/react";
import BasicResetBoardFrontGui, {
    BasicResetBoardBackGui,
    BasicResetBoardTitle,
    BasicZoneGui,
} from "client/ui/components/reset/ResetBoard";
import { RobotoSlabBold, RobotoSlabHeavy } from "client/ui/GameFonts";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import WinificationDetails from "shared/world/nodes/WinificationDetails";
import WinificationReward from "shared/world/nodes/WinificationReward";
import WinificationZone from "shared/world/nodes/WinificationZone";

const colorSequence = new ColorSequence([
    new ColorSequenceKeypoint(0, Color3.fromRGB(0, 85, 255)),
    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 85, 255)),
]);

export function WinificationDetailsGui() {
    const adornee = WinificationDetails.waitForInstance();

    return (
        <Fragment>
            <BasicResetBoardFrontGui adornee={adornee} difficulty={Difficulty.Millisecondless}>
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                <BasicResetBoardTitle text="Winification" colorSequence={colorSequence} />
                <frame
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    LayoutOrder={4}
                    Size={new UDim2(1, 0, 0.7, 0)}
                >
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={4}
                        Size={new UDim2(0.9, 0, 0, 0)}
                        Text="Yet, you seek more. True victory demands sacrifice beyond reason."
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
                        Text="Everything you’ve built — your Skill, your boosts, your advantages — must be surrendered."
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
                        Text=" But in return, you are reborn stronger than ever, earning Wins, a supreme currency used to unlock insanely powerful items that transcend all previous limits."
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
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                        VerticalFlex={Enum.UIFlexAlignment.SpaceBetween}
                    />
                </frame>
            </BasicResetBoardFrontGui>
        </Fragment>
    );
}

export function WinificationRewardGui({ text }: { text?: string }) {
    const adornee = WinificationReward.waitForInstance();

    return (
        <Fragment>
            <BasicResetBoardFrontGui adornee={adornee} difficulty={Difficulty.Millisecondless}>
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    LayoutOrder={99}
                    Size={new UDim2(0.25, 0, 0.5, 0)}
                    Text={text ?? "???"}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={80}
                    TextStrokeTransparency={0}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Right}
                >
                    <uistroke Thickness={2} />
                    <uigradient Color={colorSequence} Rotation={90} />
                    <uiscale Scale={2} />
                </textlabel>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 50)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={3} />
                <textlabel
                    AnchorPoint={new Vector2(0, 0.5)}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    LayoutOrder={5}
                    Position={new UDim2(0, 0, 0.5, 0)}
                    Size={new UDim2(0, 0, 0.9, 0)}
                    Text="Reward:"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={100}
                    TextStrokeTransparency={0}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={4} />
                </textlabel>
            </BasicResetBoardFrontGui>
            <BasicResetBoardBackGui adornee={adornee} resetLayer={RESET_LAYERS.Winification} nameOfX="skill" />
        </Fragment>
    );
}

export default function WinificationGui({ amountText, noticeText }: { amountText: string; noticeText: string }) {
    return (
        <Fragment>
            <WinificationDetailsGui />
            <WinificationRewardGui text={amountText} />
            <BasicZoneGui
                adornee={WinificationZone.waitForInstance()}
                text={noticeText}
                size={new UDim2(64, 0, 8, 0)}
                colorSequence={colorSequence}
            />
        </Fragment>
    );
}
