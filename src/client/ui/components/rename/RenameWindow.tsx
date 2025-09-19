/**
 * @fileoverview Modern React TSX implementation of the rename window using TechWindow
 *
 * Provides interface for players to rename their empire with:
 * - Clean, modern UI design with gradients and hover effects
 * - Two payment options: Robux and Funds
 * - Real-time input validation and character counting
 * - Smooth animations and professional styling
 * - Integration with existing packet system
 *
 * Replaces the old Roblox Studio UI with maintainable React components.
 */

import { OnoeNum } from "@antivivi/serikanum";
import React, { useCallback, useState } from "@rbxts/react";
import EmpireNameInput from "client/ui/components/rename/EmpireNameInput";
import PurchaseButton from "client/ui/components/rename/PurchaseButton";
import useSingleDocument from "client/ui/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/ui/components/window/TechWindow";
import { RobotoSlab, RobotoSlabBold } from "client/ui/GameFonts";
import useProperty from "client/ui/hooks/useProperty";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Packets from "shared/Packets";

/**
 * Main rename window component for empire renaming functionality
 * Features modern design with validation and smooth user interactions
 */
export default function RenameWindow() {
    const { id, visible, closeDocument } = useSingleDocument({ id: "Rename", priority: 3 });

    // Observe data from packets
    const renameCost = useProperty(Packets.renameCost);
    const empireName = useProperty(Packets.empireName);

    // Local state for form
    const [inputText, setInputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Parse empire name to get prefix and suffix
    const [prefix, suffix] = empireName!.split("'s ");
    const fullPrefix = prefix + "'s ";

    const handleTextChanged = useCallback((text: string) => {
        setInputText(text);
    }, []);

    const handleRobuxPurchase = useCallback(() => {
        if (isProcessing || inputText.size() < 5 || inputText.size() > 16) return;

        setIsProcessing(true);
        const result = Packets.promptRename.toServer(inputText, "robux");

        // Reset processing state after a short delay
        task.wait(1);
        setIsProcessing(false);

        if (result) {
            closeDocument();
        }
    }, [inputText, isProcessing, closeDocument]);

    const handleFundsPurchase = useCallback(() => {
        if (isProcessing || inputText.size() < 5 || inputText.size() > 16) return;

        setIsProcessing(true);
        const result = Packets.promptRename.toServer(inputText, "funds");

        if (result === true) {
            playSound("ItemPurchase.mp3");
            closeDocument();
        } else {
            playSound("Error.mp3");
        }

        setIsProcessing(false);
    }, [inputText, isProcessing, closeDocument]);

    const isInputValid = inputText.size() >= 5 && inputText.size() <= 16;
    const fundsPrice = CurrencyBundle.getFormatted("Funds", renameCost || new OnoeNum(0));

    return (
        <TechWindow icon={getAsset("assets/Settings.png")} id={id} title="Rename Empire" visible={visible}>
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={!isProcessing}>
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 15)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />

                {/* Header Card */}
                <frame
                    key="HeaderCard"
                    BackgroundColor3={Color3.fromRGB(25, 25, 30)}
                    BorderSizePixel={0}
                    LayoutOrder={1}
                    Size={new UDim2(0.95, 0, 0.2, 0)}
                >
                    <uicorner CornerRadius={new UDim(0, 12)} />
                    <uistroke Color={Color3.fromRGB(70, 70, 80)} Thickness={1} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 35)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(20, 20, 25)),
                            ])
                        }
                        Rotation={90}
                    />

                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                        <uilistlayout
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                        />
                        <uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />

                        {/* Main title */}
                        <textlabel
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabBold}
                            LayoutOrder={1}
                            Size={new UDim2(1, 0, 0.6, 0)}
                            Text="Rename your empire!"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled={true}
                            TextWrapped={true}
                        >
                            <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} />
                        </textlabel>

                        {/* Subtitle */}
                        <textlabel
                            BackgroundTransparency={1}
                            FontFace={RobotoSlab}
                            LayoutOrder={2}
                            Size={new UDim2(1, 0, 0.4, 0)}
                            Text="(5-16 characters)"
                            TextColor3={Color3.fromRGB(200, 200, 210)}
                            TextScaled={true}
                            TextWrapped={true}
                        >
                            <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1.5} />
                        </textlabel>
                    </frame>
                </frame>

                {/* Input Card */}
                <frame
                    key="InputCard"
                    BackgroundColor3={Color3.fromRGB(25, 25, 30)}
                    BorderSizePixel={0}
                    LayoutOrder={2}
                    Size={new UDim2(0.95, 0, 0.25, 0)}
                >
                    <uicorner CornerRadius={new UDim(0, 12)} />
                    <uistroke Color={Color3.fromRGB(70, 70, 80)} Thickness={1} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 35)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(20, 20, 25)),
                            ])
                        }
                        Rotation={90}
                    />

                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                        <uilistlayout
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                        />
                        <uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />

                        {/* Empire name input */}
                        <EmpireNameInput
                            key="NameInput"
                            prefix={fullPrefix}
                            initialValue={suffix || ""}
                            onTextChanged={handleTextChanged}
                            maxLength={16}
                            minLength={5}
                        />
                    </frame>
                </frame>

                {/* Purchase Card */}
                <frame
                    key="PurchaseCard"
                    BackgroundColor3={Color3.fromRGB(25, 25, 30)}
                    BorderSizePixel={0}
                    LayoutOrder={3}
                    Size={new UDim2(0.95, 0, 0.25, 0)}
                >
                    <uicorner CornerRadius={new UDim(0, 12)} />
                    <uistroke Color={Color3.fromRGB(70, 70, 80)} Thickness={1} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(30, 30, 35)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(20, 20, 25)),
                            ])
                        }
                        Rotation={90}
                    />

                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                        <uilistlayout
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            Padding={new UDim(0, 15)}
                        />

                        <uipadding
                            PaddingBottom={new UDim(0, 20)}
                            PaddingLeft={new UDim(0, 20)}
                            PaddingRight={new UDim(0, 20)}
                            PaddingTop={new UDim(0, 20)}
                        />

                        {/* Purchase section label */}
                        <textlabel
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabBold}
                            LayoutOrder={1}
                            Size={new UDim2(1, 0, 0, 30)}
                            Text="Purchase for:"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={24}
                            TextWrapped={true}
                            TextYAlignment={Enum.TextYAlignment.Center}
                        >
                            <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1.5} />
                        </textlabel>

                        {/* Purchase options */}
                        <frame
                            key="PurchaseOptions"
                            BackgroundTransparency={1}
                            LayoutOrder={2}
                            Size={new UDim2(0.9, 0, 0, 40)}
                        >
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Horizontal}
                                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                                Padding={new UDim(0, 25)}
                                SortOrder={Enum.SortOrder.LayoutOrder}
                                VerticalAlignment={Enum.VerticalAlignment.Center}
                            />

                            <PurchaseButton
                                key="RobuxButton"
                                text="Robux"
                                price="25 Robux"
                                currency="robux"
                                onClick={handleRobuxPurchase}
                                disabled={!isInputValid || isProcessing}
                            />

                            {/* "or" separator */}
                            <textlabel
                                key="OrLabel"
                                BackgroundTransparency={1}
                                FontFace={RobotoSlabBold}
                                Size={new UDim2(0, 40, 0.8, 0)}
                                Text="or"
                                TextColor3={Color3.fromRGB(200, 200, 210)}
                                TextSize={20}
                                TextWrapped={true}
                                TextYAlignment={Enum.TextYAlignment.Center}
                            >
                                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1.5} />
                            </textlabel>

                            <PurchaseButton
                                key="FundsButton"
                                text="Funds"
                                price={fundsPrice}
                                currency="funds"
                                onClick={handleFundsPurchase}
                                disabled={!isInputValid || isProcessing}
                            />
                        </frame>
                    </frame>
                </frame>

                {/* Warning Card */}
                <frame
                    key="WarningCard"
                    BackgroundColor3={Color3.fromRGB(40, 25, 25)}
                    BorderSizePixel={0}
                    LayoutOrder={4}
                    Size={new UDim2(0.95, 0, 0.15, 0)}
                >
                    <uicorner CornerRadius={new UDim(0, 12)} />
                    <uistroke Color={Color3.fromRGB(100, 60, 60)} Thickness={1} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(45, 30, 30)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(35, 20, 20)),
                            ])
                        }
                        Rotation={90}
                    />

                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                        <uilistlayout
                            HorizontalAlignment={Enum.HorizontalAlignment.Center}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                        />

                        <uipadding
                            PaddingBottom={new UDim(0, 5)}
                            PaddingLeft={new UDim(0, 20)}
                            PaddingRight={new UDim(0, 20)}
                            PaddingTop={new UDim(0, 5)}
                        />

                        {/* Warning icon and text */}
                        <frame BackgroundTransparency={1} LayoutOrder={1} Size={new UDim2(1, 0, 1, 0)}>
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Horizontal}
                                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                                VerticalAlignment={Enum.VerticalAlignment.Center}
                                Padding={new UDim(0, 10)}
                                SortOrder={Enum.SortOrder.LayoutOrder}
                            />

                            {/* Warning icon */}
                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoSlabBold}
                                LayoutOrder={1}
                                Size={new UDim2(0, 30, 0, 30)}
                                Text="⚠"
                                TextColor3={Color3.fromRGB(255, 200, 100)}
                                TextSize={24}
                                TextScaled={true}
                            />

                            {/* Warning text */}
                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoSlab}
                                LayoutOrder={2}
                                Size={new UDim2(1, -40, 1, 0)}
                                Text={`Purchasing with Funds will increase the next Funds price by 1000x.
If you are on the leaderboards, you may need to rejoin to view the rename.`}
                                TextColor3={Color3.fromRGB(220, 180, 180)}
                                TextSize={16}
                                TextWrapped={true}
                                TextXAlignment={Enum.TextXAlignment.Left}
                                TextYAlignment={Enum.TextYAlignment.Center}
                            >
                                <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={1} />
                            </textlabel>
                        </frame>
                    </frame>
                </frame>
            </frame>
            {/* Processing indicator */}
            {isProcessing && (
                <frame
                    key="ProcessingOverlay"
                    BackgroundTransparency={1}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 1, 0)}
                    ZIndex={10}
                >
                    <textlabel
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(0.6, 0, 0.2, 0)}
                        Text="Processing..."
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={24}
                    >
                        <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} />
                    </textlabel>
                </frame>
            )}
        </TechWindow>
    );
}
