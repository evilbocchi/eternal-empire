import { OnoeNum } from "@antivivi/serikanum";
import React, { Fragment, useMemo } from "@rbxts/react";
import StringBuilder from "@rbxts/stringbuilder";
import { TooltipManager } from "client/ui/components/tooltip/TooltipWindow";
import { RobotoMono, RobotoSlab, RobotoSlabBold } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Softcaps, { performSoftcap } from "shared/currency/mechanics/Softcaps";

interface BalanceOptionProps {
    currency: Currency;
    amount: OnoeNum;
    income?: OnoeNum;
    bombEnabled?: boolean;
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
                Rotation={270}
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
export default function BalanceOption({ currency, amount, income, bombEnabled, formatCurrency }: BalanceOptionProps) {
    const details = CURRENCY_DETAILS[currency];
    const softcapColor = Color3.fromRGB(255, 77, 33);

    const tooltipCurrencyColor = useMemo(() => {
        return details.color.Lerp(Color3.fromRGB(255, 255, 255), 0.8).ToHex();
    }, []);

    // Calculate softcap information
    const { capped, softcapText, softcapStart } = useMemo(() => {
        const softcap = Softcaps[currency];
        if (!softcap) return { capped: false };

        let capped = false;
        const builder = new StringBuilder();
        const starts = new Array<OnoeNum>();

        const [recippow, recippowStarts] = performSoftcap(amount, softcap.recippow);
        if (recippow !== undefined) {
            capped = true;
            builder.append("^(1/").append(recippow.toString()).append(")");
            if (recippowStarts) {
                starts.push(recippowStarts);
            }
        }

        // Check division softcap
        const [div, divStarts] = performSoftcap(amount, softcap.div);
        if (div !== undefined) {
            capped = true;
            builder.append("/").append(div.toString());
            if (divStarts) {
                starts.push(divStarts);
            }
        }
        const softcapText = builder.toString();

        return { capped, softcapText, softcapStart: OnoeNum.min(...starts) };
    }, [currency, amount]);

    const showIncome = income && !income.lessEquals(0);

    const isFunds = currency === "Funds";
    return (
        <frame
            BackgroundTransparency={1}
            Event={{
                MouseMoved: () => {
                    const tooltipBuilder = new StringBuilder(details.description!)
                        .append("\n<font size='16' color='#")
                        .append(tooltipCurrencyColor)
                        .append("'>You have ")
                        .append(OnoeNum.toSuffix(amount))
                        .append(" (")
                        .append(OnoeNum.toScientific(amount))
                        .append(") ")
                        .append(currency)
                        .append(".</font>");
                    if (capped === true) {
                        tooltipBuilder
                            .append("\n<font color='#")
                            .append(softcapColor.ToHex())
                            .append("' size='16'>")
                            .append(currency)
                            .append(" gain is currently softcapped by ")
                            .append(softcapText)
                            .append(" as it exceeds ")
                            .append(formatCurrency(currency, softcapStart!))
                            .append(".</font>");
                    }
                    TooltipManager.showTooltip({
                        message: tooltipBuilder.toString(),
                    });
                },
                MouseLeave: () => {
                    TooltipManager.hideTooltip();
                },
            }}
            LayoutOrder={details.layoutOrder}
            Size={new UDim2(1, 0, 0.045, isFunds ? 30 : 21)}
        >
            <frame
                BackgroundColor3={details.color}
                BorderColor3={Color3.fromRGB(50, 50, 50)}
                BorderSizePixel={3}
                Size={new UDim2(1, 0, 0.8, 0)}
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
                {/* Balance Label */}
                <textlabel
                    Active={true}
                    AnchorPoint={new Vector2(0, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Position={new UDim2(0, 24, 0.5, 0)}
                    Size={new UDim2(1, -30, isFunds ? 0.7 : 0.75, 0)}
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
                    <uigradient
                        Color={
                            bombEnabled
                                ? new ColorSequence(new Color3(1, 0.98, 0.87), new Color3(1, 0.84, 0))
                                : new ColorSequence(new Color3(1, 1, 1))
                        }
                        Rotation={98}
                    />
                </textlabel>

                {/* Styling */}
                <BalanceOptionStyling details={details} />
            </frame>

            {/* Income Container */}
            {showIncome && (
                <frame
                    Active={true}
                    AnchorPoint={new Vector2(0, 1)}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    LayoutOrder={2}
                    Position={new UDim2(0, 24, 1, 0)}
                    Size={new UDim2(1, -30, 0.35, 0)}
                >
                    {/* Income Label */}
                    <textlabel
                        Active={true}
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlab}
                        LayoutOrder={1}
                        Size={new UDim2(0, 0, 1, 0)}
                        Text={`${formatCurrency(currency, income!)}/s`}
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
                    {/* Softcap Label */}
                    {capped && (
                        <textlabel
                            Active={true}
                            AutomaticSize={Enum.AutomaticSize.X}
                            BackgroundTransparency={1}
                            FontFace={RobotoMono}
                            LayoutOrder={2}
                            Position={new UDim2(0, 0, 1, 0)}
                            Size={new UDim2(0, 0, 0.6, 0)}
                            Text={softcapText}
                            TextColor3={softcapColor}
                            TextScaled={true}
                            TextWrapped={true}
                            TextXAlignment={Enum.TextXAlignment.Left}
                        >
                            <uistroke Color={details.color.Lerp(Color3.fromRGB(0, 0, 0), 0.9)} Thickness={2} />
                        </textlabel>
                    )}

                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        Padding={new UDim(0, 4)}
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />
                </frame>
            )}
        </frame>
    );
}
