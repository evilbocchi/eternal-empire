import { OnoeNum } from "@antivivi/serikanum";
import React, { Fragment, useEffect, useMemo, useRef } from "@rbxts/react";
import { Debris, TweenService } from "@rbxts/services";
import StringBuilder from "@rbxts/stringbuilder";
import displayBalanceCurrency from "client/ui/components/balance/displayBalanceCurrency";
import { TooltipManager } from "client/ui/components/tooltip/TooltipWindow";
import { RobotoMono, RobotoSlab, RobotoSlabBold } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Softcaps, { performSoftcap } from "shared/currency/mechanics/Softcaps";

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

export class BalanceOptionManager {
    static readonly imagePerCurrency = new Map<Currency, ImageLabel>();
}

/**
 * Individual currency balance display component.
 * Shows currency icon, amount, income rate, and softcap information.
 */
export default function BalanceOption({
    currency,
    amount,
    income,
    difference,
    bombBoost,
}: {
    currency: Currency;
    amount: OnoeNum;
    income?: OnoeNum;
    bombBoost?: OnoeNum;
    difference?: OnoeNum;
    layoutOrder: number;
}) {
    const imageRef = useRef<ImageLabel>();
    const wrapperRef = useRef<Frame>();
    const incomeRef = useRef<TextLabel>();
    const details = CURRENCY_DETAILS[currency];
    const softcapColor = Color3.fromRGB(255, 77, 33);

    const tooltipCurrencyColor = useMemo(() => {
        return details.color.Lerp(Color3.fromRGB(255, 255, 255), 0.8).ToHex();
    }, []);

    const imageLabel = imageRef.current;
    if (imageLabel !== undefined) {
        BalanceOptionManager.imagePerCurrency.set(currency, imageLabel);
    }

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

    useEffect(() => {
        if (difference === undefined || difference.equals(0)) return;

        const wrapper = wrapperRef.current;
        if (wrapper === undefined) return;
        const incomeLabel = incomeRef.current;
        if (incomeLabel === undefined) return;

        // Show floating difference text
        const diffLabel = incomeLabel.Clone();
        diffLabel.AnchorPoint = new Vector2(1, 0.5);
        diffLabel.Position = new UDim2(0, -25, 0.5, 0);
        diffLabel.Size = new UDim2(0, 0, 0, 0);
        diffLabel.TextSize = 20;
        diffLabel.TextScaled = false;
        diffLabel.TextWrapped = false;
        diffLabel.Text = `${difference.moreThan(0) ? "+" : "-"}${displayBalanceCurrency(currency, difference)}`;
        diffLabel.TextXAlignment = Enum.TextXAlignment.Right;
        diffLabel.Rotation = math.random(-10, 10);
        diffLabel.ZIndex = 3;
        const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quart, Enum.EasingDirection.In);
        TweenService.Create(diffLabel, tweenInfo, {
            Position: diffLabel.Position.add(new UDim2(0, 0, 0, 50)),
            TextTransparency: 1,
            Rotation: diffLabel.Rotation + math.random(-45, 45),
        }).Play();
        const stroke = diffLabel.FindFirstChildOfClass("UIStroke");
        if (stroke) {
            TweenService.Create(stroke, tweenInfo, { Transparency: 1 }).Play();
        }
        diffLabel.Parent = wrapper;
        Debris.AddItem(diffLabel, 6);
    }, [difference]);

    const showIncome = income && !income.lessEquals(0);

    const isFunds = currency === "Funds";
    return (
        <frame
            ref={wrapperRef}
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
                            .append(displayBalanceCurrency(currency, softcapStart!))
                            .append(".</font>");
                    }

                    if (bombBoost) {
                        tooltipBuilder
                            .append("\n<font color='#FFD700' size='16'>A bomb is active, increasing ")
                            .append(currency)
                            .append(" income by x")
                            .append(bombBoost)
                            .append("!</font>");
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
                    ref={imageRef}
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
                    Text={displayBalanceCurrency(currency, amount)}
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
                            bombBoost
                                ? new ColorSequence(new Color3(1, 0.98, 0.87), new Color3(1, 0.84, 0))
                                : new ColorSequence(new Color3(1, 1, 1))
                        }
                        Rotation={12}
                    />
                </textlabel>

                {/* Styling */}
                <BalanceOptionStyling details={details} />
            </frame>

            {/* Income Container */}
            <frame
                Active={true}
                AnchorPoint={new Vector2(0, 1)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                LayoutOrder={2}
                Position={new UDim2(0, 24, 1, 0)}
                Size={new UDim2(1, -30, 0.35, 0)}
                Visible={showIncome || capped}
            >
                {/* Income Label */}
                <textlabel
                    ref={incomeRef}
                    Active={true}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    LayoutOrder={1}
                    Size={new UDim2(0, 0, 1, 0)}
                    Text={`${displayBalanceCurrency(currency, income!)}/s`}
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
        </frame>
    );
}
