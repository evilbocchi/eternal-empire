import { OnoeNum } from "@antivivi/serikanum";
import React, { Fragment, useMemo } from "@rbxts/react";
import StringBuilder from "@rbxts/stringbuilder";
import { RobotoSlab, RobotoSlabBold } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Softcaps, { performSoftcap } from "shared/Softcaps";

interface BalanceOptionProps {
    currency: Currency;
    amount: OnoeNum;
    income?: OnoeNum;
    formatCurrency: (currency: Currency, amount: OnoeNum) => string;
    layoutOrder: number;
}

export function BalanceOptionStyling({ details }: { details: CurrencyDetails }) {
    return (
        <Fragment>
            <uistroke Color={details.color.Lerp(Color3.fromRGB(255, 255, 255), 0.3)}>
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.73, Color3.fromRGB(124, 124, 124)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                        ])
                    }
                    Rotation={60}
                />
            </uistroke>
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(125, 125, 125)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(217, 217, 217)),
                    ])
                }
                Rotation={272}
            />
            <folder>
                <imagelabel
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/GridCheckers.png")}
                    ImageColor3={new Color3(0, 0, 0)}
                    ImageTransparency={0.95}
                    TileSize={new UDim2(0, 75, 0, 75)}
                    Position={new UDim2(0.5, 0, 0, 0)}
                    ScaleType={Enum.ScaleType.Tile}
                    Size={new UDim2(1, 20, 1, 0)}
                    ZIndex={-4}
                />
                <imagelabel
                    AnchorPoint={new Vector2(1, 0)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/GlassReflection.png")}
                    ImageColor3={new Color3(0, 0, 0)}
                    ImageTransparency={0.9}
                    Rotation={270}
                    Position={new UDim2(1, 0, 0, 0)}
                    ScaleType={Enum.ScaleType.Fit}
                    Size={new UDim2(1, 0, 1, 0)}
                    ZIndex={-2}
                />
            </folder>
        </Fragment>
    );
}

/**
 * Individual currency balance display component.
 * Shows currency icon, amount, income rate, and softcap information.
 */
export default function BalanceOption({ currency, amount, income, formatCurrency, layoutOrder }: BalanceOptionProps) {
    const details = CURRENCY_DETAILS[currency];

    // Calculate softcap information
    const softcapInfo = useMemo(() => {
        const softcap = Softcaps[currency];
        if (!softcap) return { capped: false, softcapText: "" };

        let capped = false;
        const builder = new StringBuilder();

        const [recippow, recippowStarts] = performSoftcap(amount, softcap.recippow);
        if (recippow !== undefined) {
            capped = true;
            builder.append("^(1/").append(recippowStarts.toString()).append(")");
        }

        // Check division softcap
        const [div, divStarts] = performSoftcap(amount, softcap.div);
        if (div !== undefined) {
            capped = true;
            builder.append("/").append(divStarts.toString());
        }

        return { capped, softcapText: builder.toString() };
    }, [currency, amount]);

    const showIncome = income && !income.lessEquals(0);

    const incomeText = new StringBuilder(formatCurrency(currency, income!));
    incomeText.append("/s");
    if (softcapInfo.capped) {
        incomeText.append(" <font color='#FF0000'>").append(softcapInfo.softcapText).append("</font>");
    }

    return (
        <frame
            BackgroundColor3={details.color}
            BorderColor3={Color3.fromRGB(50, 50, 50)}
            BorderSizePixel={3}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 0, 50)}
        >
            {/* Currency Icon */}
            <imagelabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Image={details.image}
                LayoutOrder={-2}
                Position={new UDim2(0, 0, 0.5, 0)}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(0.9, 0, 0.9, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
                ZIndex={0}
            />

            {/* Amount Container */}
            <frame
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                Position={new UDim2(0, 30, 0.5, 0)}
                Size={new UDim2(1, -35, 1, 0)}
            >
                {/* Balance Label */}
                <textlabel
                    Active={true}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Size={new UDim2(1, 0, 0.6, 0)}
                    Text={formatCurrency(currency, amount)}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Color={details.color.Lerp(Color3.fromRGB(0, 0, 0), 0.3)} Thickness={2}>
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63)),
                                ])
                            }
                            Rotation={90}
                        />
                    </uistroke>
                </textlabel>

                {/* Income Container */}
                {showIncome && (
                    <frame
                        Active={true}
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        LayoutOrder={2}
                        Size={new UDim2(1, 0, 0.3, 0)}
                    >
                        {/* Income Label */}
                        <textlabel
                            Active={true}
                            AutomaticSize={Enum.AutomaticSize.X}
                            BackgroundTransparency={1}
                            FontFace={RobotoSlab}
                            LayoutOrder={1}
                            RichText={true}
                            Size={new UDim2(1, 0, 1, 0)}
                            Text={incomeText.toString()}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled={true}
                            TextWrapped={true}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        >
                            <uistroke Color={details.color.Lerp(Color3.fromRGB(0, 0, 0), 0.3)} Thickness={2}>
                                <uigradient
                                    Color={
                                        new ColorSequence([
                                            new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)),
                                            new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63)),
                                        ])
                                    }
                                    Rotation={90}
                                />
                            </uistroke>
                        </textlabel>

                        <uilistlayout
                            FillDirection={Enum.FillDirection.Horizontal}
                            Padding={new UDim(0, 4)}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                        />
                    </frame>
                )}

                <uilistlayout
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalFlex={Enum.UIFlexAlignment.Fill}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
            </frame>

            {/* Styling */}
            <BalanceOptionStyling details={details} />
        </frame>
    );
}
