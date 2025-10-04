import React, { useMemo } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import useHover from "client/hooks/useHover";
import { getAsset } from "shared/asset/AssetMap";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import Items from "shared/items/Items";
import MARKETPLACE_CONFIG from "shared/marketplace/MarketplaceListing";

const UNIQUE_MIN_POT_COLOR = Color3.fromRGB(255, 0, 0);
const UNIQUE_MAX_POT_COLOR = Color3.fromRGB(0, 255, 255);

interface ListingPotDisplay {
    key: string;
    label: string;
    value: string;
    color: Color3;
}

interface UniqueListingDetails {
    itemName: string;
    potEntries: ListingPotDisplay[];
}

function colorToHex(color: Color3): string {
    const r = math.clamp(math.floor(color.R * 255 + 0.5), 0, 255);
    const g = math.clamp(math.floor(color.G * 255 + 0.5), 0, 255);
    const b = math.clamp(math.floor(color.B * 255 + 0.5), 0, 255);
    return string.format("%02X%02X%02X", r, g, b);
}

function formatPotLabel(potName: string): string {
    let [label] = potName.gsub("_", " ");
    [label] = label.gsub("([A-Z])", " %1");
    [label] = label.gsub("%s+", " ");
    [label] = label.gsub("^%s+", "");
    [label] = label.gsub("%s+$", "");

    if (label === "") {
        return potName;
    }

    const words = label.split(" ");
    const formatted = new Array<string>();
    for (const word of words) {
        if (word === "") continue;
        const lower = word.lower();
        const first = lower.sub(1, 1);
        const rest = lower.sub(2);
        if (first === "") {
            formatted.push(rest);
        } else {
            formatted.push(`${first.upper()}${rest}`);
        }
    }
    return formatted.join(" ");
}

function formatPotValue(value: number, integer?: boolean): string {
    if (integer) {
        return tostring(math.floor(value + 0.5));
    }

    const magnitude = math.abs(value);
    if (magnitude >= 1000) {
        return string.format("%.0f", value);
    }
    if (magnitude >= 10) {
        return string.format("%.1f", value);
    }
    return string.format("%.2f", value);
}

export function ActionButton({
    text,
    price,
    backgroundColor,
    layoutOrder,
    onClick,
}: {
    text: string;
    price?: number;
    backgroundColor: Color3;
    layoutOrder?: number;
    onClick?: () => void;
}) {
    const { hovering, events } = useHover({});
    return (
        <textbutton
            AutoButtonColor={false}
            BackgroundColor3={hovering ? backgroundColor.Lerp(Color3.fromRGB(255, 255, 255), 0.15) : backgroundColor}
            BorderSizePixel={0}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 1, 0)}
            Text={""}
            TextColor3={Color3.fromRGB(0, 0, 0)}
            TextSize={14}
            Event={{
                Activated: (rbx) => {
                    const tweenInfo = new TweenInfo(0.15, Enum.EasingStyle.Back, Enum.EasingDirection.Out, 0, false, 0);

                    // Scale down first
                    const scaleDown = TweenService.Create(rbx, new TweenInfo(0.1), {
                        Size: new UDim2(1, -5, 1, -5),
                    });
                    scaleDown.Play();
                    scaleDown.Completed.Once(() => {
                        // Then scale back up
                        const scaleUp = TweenService.Create(rbx, tweenInfo, {
                            Size: new UDim2(1, 0, 1, 0),
                        });
                        scaleUp.Play();
                    });
                    onClick?.();
                },
                ...events,
            }}
        >
            <uistroke
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Thickness={2}
                Color={hovering ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(0, 0, 0)}
                Transparency={0}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0.9, 0, 0.4, 0)}
                Text={text}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={1.5} />
            </textlabel>
            {price !== undefined && (
                <frame BackgroundTransparency={1} Size={new UDim2(0.9, 0, 0.3, 0)}>
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        Padding={new UDim(0, 2)}
                    />
                    <imagelabel
                        BackgroundTransparency={1}
                        Image={getAsset("assets/Diamond.png")}
                        Size={new UDim2(1, 0, 1, 0)}
                        SizeConstraint={Enum.SizeConstraint.RelativeYY}
                        ScaleType={Enum.ScaleType.Fit}
                    />
                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        FontFace={RobotoMonoBold}
                        Size={new UDim2(0, 0, 1, 0)}
                        Text={tostring(price)}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={1.5} Color={Color3.fromRGB(255, 255, 255)}>
                            <uigradient
                                Color={new ColorSequence(Color3.fromRGB(0, 51, 77), Color3.fromRGB(0, 31, 59))}
                            />
                        </uistroke>
                        <uigradient
                            Color={new ColorSequence(Color3.fromRGB(199, 222, 255), Color3.fromRGB(189, 255, 245))}
                            Rotation={90}
                        />
                    </textlabel>
                </frame>
            )}
        </textbutton>
    );
}

export default function ListingCard({
    listing,
    onBuy,
    onCancel,
    isOwner = false,
}: {
    listing: MarketplaceListing;
    onBuy?: (uuid: string) => void;
    onCancel?: (uuid: string) => void;
    isOwner?: boolean;
}) {
    const uniqueDetails = useMemo<UniqueListingDetails>(() => {
        const fallbackName = `Item ${listing.uuid.sub(1, 8)}…`;
        const uniqueItemInstance = listing.uniqueItem;

        if (uniqueItemInstance === undefined) {
            return {
                itemName: fallbackName,
                potEntries: [],
            };
        }

        const item = Items.getItem(uniqueItemInstance.baseItemId);
        if (item === undefined) {
            return {
                itemName: uniqueItemInstance.baseItemId,
                potEntries: [],
            };
        }

        const uniqueTrait = item.findTrait("Unique");
        if (uniqueTrait === undefined) {
            return {
                itemName: item.name,
                potEntries: [],
            };
        }

        const scaledPots = uniqueTrait.getScaledPots(uniqueItemInstance);
        const potConfigs = uniqueTrait.getPotConfigs();
        const potEntries = new Array<ListingPotDisplay>();

        for (const [potName, config] of potConfigs) {
            const scaledValue = scaledPots.get(potName);
            if (scaledValue === undefined) continue;

            const label = formatPotLabel(potName);
            const value = formatPotValue(scaledValue, config.integer);
            const range = config.max - config.min;
            const alpha = range > 0 ? math.clamp((scaledValue - config.min) / range, 0, 1) : 1;
            const color = UNIQUE_MIN_POT_COLOR.Lerp(UNIQUE_MAX_POT_COLOR, alpha);

            potEntries.push({
                key: potName,
                label,
                value,
                color,
            });
        }

        return {
            itemName: item.name,
            potEntries,
        };
    }, [listing.uniqueItem, listing.uuid]);

    const itemDisplayName = uniqueDetails.itemName;
    const potEntries = uniqueDetails.potEntries;

    const handleBuy = () => {
        if (onBuy) onBuy(listing.uuid);
    };

    const handleCancel = () => {
        if (onCancel) onCancel(listing.uuid);
    };

    const formatTimeRemaining = (expires?: number): string => {
        if (!expires) return "No expiry";
        const now = os.time();
        const remaining = expires - now;
        if (remaining <= 0) return "Expired";

        const days = math.floor(remaining / (24 * 60 * 60));
        const hours = math.floor((remaining % (24 * 60 * 60)) / (60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    const accentColor = Color3.fromRGB(108, 226, 255);
    const accentGlowColor = Color3.fromRGB(61, 145, 255);

    return (
        <frame
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundColor3={Color3.fromRGB(16, 19, 27)}
            BackgroundTransparency={0}
            BorderColor3={Color3.fromRGB(255, 255, 255)}
            BorderSizePixel={1}
            Size={new UDim2(1, 0, 0, 0)}
        >
            <uigradient
                Rotation={270}
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, accentColor),
                        new ColorSequenceKeypoint(1, accentGlowColor),
                    ])
                }
                Transparency={
                    new NumberSequence([new NumberSequenceKeypoint(0, 0.1), new NumberSequenceKeypoint(1, 0.4)])
                }
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                Padding={new UDim(0.06, 0)}
            />
            <uipadding
                PaddingTop={new UDim(0, 4)}
                PaddingBottom={new UDim(0, 4)}
                PaddingLeft={new UDim(0, 12)}
                PaddingRight={new UDim(0, 12)}
            />

            <frame AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1} Size={new UDim2(0.62, 0, 0, 0)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Left}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                />

                {/** Item Name */}
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 30)}>
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                        Padding={new UDim(0, 10)}
                    />

                    <textlabel
                        AutomaticSize={Enum.AutomaticSize.X}
                        BackgroundTransparency={1}
                        FontFace={RobotoMonoBold}
                        Size={new UDim2(0, 0, 1, 0)}
                        Text={itemDisplayName}
                        TextColor3={Color3.fromRGB(213, 233, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    />
                </frame>

                {/** Item Description */}
                {potEntries.size() > 0 && (
                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y}>
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Vertical}
                            HorizontalAlignment={Enum.HorizontalAlignment.Left}
                            VerticalAlignment={Enum.VerticalAlignment.Top}
                            Padding={new UDim(0, 6)}
                        />
                        {potEntries.map((entry) => (
                            <textlabel
                                key={entry.key}
                                AutomaticSize={Enum.AutomaticSize.Y}
                                BackgroundTransparency={1}
                                FontFace={RobotoMono}
                                Size={new UDim2(1, 0, 0, 0)}
                                Text={`<font color="#8EA8BD">${entry.label}:</font> <font color="#${colorToHex(entry.color)}">${entry.value}</font>`}
                                RichText={true}
                                TextColor3={Color3.fromRGB(213, 233, 255)}
                                TextSize={24}
                                TextXAlignment={Enum.TextXAlignment.Left}
                            />
                        ))}
                    </frame>
                )}

                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    Size={new UDim2(1, 0, 0, 16)}
                    Text={`Expires in ${formatTimeRemaining(listing.created + MARKETPLACE_CONFIG.LISTING_DURATION)}`}
                    TextColor3={Color3.fromRGB(79, 107, 130)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                />
            </frame>

            <frame BackgroundTransparency={1} Size={new UDim2(0.32, 0, 0, 50)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Right}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                    Padding={new UDim(0, 12)}
                />

                {isOwner ? (
                    <ActionButton text="Cancel" backgroundColor={Color3.fromRGB(204, 67, 88)} onClick={handleCancel} />
                ) : (
                    <ActionButton
                        text="Buy Now"
                        price={listing.price}
                        backgroundColor={Color3.fromRGB(55, 189, 255)}
                        onClick={handleBuy}
                    />
                )}
            </frame>
        </frame>
    );
}
