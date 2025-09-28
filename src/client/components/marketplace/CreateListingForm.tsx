import React, { useState, useEffect } from "@rbxts/react";
import ActionButton from "client/components/item/printer/ActionButton";
import { getAsset } from "shared/asset/AssetMap";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import Packets from "shared/Packets";

export default function CreateListingForm({
    onSubmit,
}: {
    onSubmit: (uuid: string, price: number, listingType: "buyout" | "auction", duration: number) => void;
}) {
    const [selectedUuid, setSelectedUuid] = useState("");
    const [price, setPrice] = useState("");
    const [listingType, setListingType] = useState<"buyout" | "auction">("buyout");
    const [duration, setDuration] = useState("7"); // days
    const [availableItems, setAvailableItems] = useState<string[]>([]);

    // Load player's available unique items
    useEffect(() => {
        const uniqueInstances = Packets.uniqueInstances.get() ?? new Map();
        const items: string[] = [];
        for (const [uuid, item] of uniqueInstances) {
            // Only include items that aren't placed
            if (!item.placed) {
                items.push(uuid);
            }
        }
        setAvailableItems(items);
    }, []);

    const handleSubmit = () => {
        if (selectedUuid === "" || price === "") return;

        const priceNum = tonumber(price);
        if (!priceNum || priceNum <= 0) return;

        const durationNum = tonumber(duration);
        if (!durationNum || durationNum <= 0) return;

        onSubmit(selectedUuid, priceNum, listingType, durationNum * 24 * 60 * 60);

        // Reset form
        setSelectedUuid("");
        setPrice("");
        setDuration("7");
    };

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
            <scrollingframe
                BackgroundTransparency={1}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                ScrollBarThickness={6}
                ScrollBarImageColor3={Color3.fromRGB(74, 140, 255)}
                Size={new UDim2(1, 0, 1, 0)}
            >
                <uipadding
                    PaddingTop={new UDim(0, 12)}
                    PaddingBottom={new UDim(0, 24)}
                    PaddingLeft={new UDim(0, 18)}
                    PaddingRight={new UDim(0, 18)}
                />
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                    Padding={new UDim(0, 18)}
                />

                {/* Title */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    Size={new UDim2(0.9, 0, 0, 48)}
                    Text="Create New Listing"
                    TextColor3={Color3.fromRGB(226, 238, 255)}
                    TextScaled={true}
                >
                    <uistroke Thickness={1} Color={Color3.fromRGB(111, 182, 255)} Transparency={0.35} />
                </textlabel>

                {/* Helper to render card wrapper */}
                <frame
                    BackgroundColor3={Color3.fromRGB(18, 24, 36)}
                    BorderSizePixel={0}
                    Size={new UDim2(0.9, 0, 0, 0)}
                    AutomaticSize={Enum.AutomaticSize.Y}
                    ClipsDescendants={true}
                >
                    <uicorner CornerRadius={new UDim(0, 10)} />
                    <uistroke Thickness={1} Color={Color3.fromRGB(58, 86, 142)} Transparency={0.4} />
                    <uigradient
                        Rotation={0}
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(20, 26, 39)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(12, 15, 24)),
                            ])
                        }
                    />
                    <imagelabel
                        BackgroundTransparency={1}
                        Image={getAsset("assets/GridHighContrast.png")}
                        ImageColor3={Color3.fromRGB(116, 164, 255)}
                        ImageTransparency={0.92}
                        ScaleType={Enum.ScaleType.Tile}
                        Size={new UDim2(1, 0, 1, 0)}
                        TileSize={new UDim2(0, 120, 0, 120)}
                        ZIndex={0}
                    />

                    <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} ZIndex={1}>
                        <uipadding
                            PaddingTop={new UDim(0, 16)}
                            PaddingBottom={new UDim(0, 16)}
                            PaddingLeft={new UDim(0, 18)}
                            PaddingRight={new UDim(0, 18)}
                        />
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Vertical}
                            HorizontalAlignment={Enum.HorizontalAlignment.Left}
                            VerticalAlignment={Enum.VerticalAlignment.Top}
                            Padding={new UDim(0, 16)}
                        />

                        {/* Item Selection */}
                        <frame
                            BackgroundTransparency={1}
                            Size={new UDim2(1, 0, 0, 0)}
                            AutomaticSize={Enum.AutomaticSize.Y}
                        >
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Vertical}
                                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                                VerticalAlignment={Enum.VerticalAlignment.Top}
                                Padding={new UDim(0, 10)}
                            />

                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoMonoBold}
                                Size={new UDim2(1, 0, 0, 26)}
                                Text="Select Item to List"
                                TextColor3={Color3.fromRGB(204, 222, 255)}
                                TextScaled={true}
                                TextXAlignment={Enum.TextXAlignment.Left}
                            >
                                <uistroke Thickness={1} Color={Color3.fromRGB(61, 145, 255)} Transparency={0.4} />
                            </textlabel>

                            <scrollingframe
                                BackgroundColor3={Color3.fromRGB(24, 32, 48)}
                                BorderSizePixel={0}
                                AutomaticCanvasSize={Enum.AutomaticSize.X}
                                CanvasSize={new UDim2(0, 0, 0, 0)}
                                ScrollBarThickness={6}
                                ScrollBarImageColor3={Color3.fromRGB(74, 140, 255)}
                                ScrollingDirection={Enum.ScrollingDirection.X}
                                Size={new UDim2(1, 0, 0, 80)}
                            >
                                <uicorner CornerRadius={new UDim(0, 8)} />
                                <uistroke Thickness={1} Color={Color3.fromRGB(58, 86, 142)} Transparency={0.35} />
                                <uipadding
                                    PaddingTop={new UDim(0, 6)}
                                    PaddingBottom={new UDim(0, 6)}
                                    PaddingLeft={new UDim(0, 8)}
                                    PaddingRight={new UDim(0, 8)}
                                />
                                <uilistlayout
                                    FillDirection={Enum.FillDirection.Horizontal}
                                    HorizontalAlignment={Enum.HorizontalAlignment.Left}
                                    Padding={new UDim(0, 8)}
                                />

                                {availableItems.size() === 0 ? (
                                    <textlabel
                                        BackgroundTransparency={1}
                                        FontFace={RobotoMono}
                                        Size={new UDim2(1, 0, 1, 0)}
                                        Text="No eligible items"
                                        TextColor3={Color3.fromRGB(142, 168, 189)}
                                        TextScaled={true}
                                        TextXAlignment={Enum.TextXAlignment.Center}
                                    />
                                ) : (
                                    availableItems.map((uuid) => {
                                        const isSelected = selectedUuid === uuid;
                                        return (
                                            <textbutton
                                                key={`item-${uuid}`}
                                                AutoButtonColor={false}
                                                BackgroundColor3={
                                                    isSelected
                                                        ? Color3.fromRGB(55, 189, 255)
                                                        : Color3.fromRGB(29, 39, 59)
                                                }
                                                BackgroundTransparency={isSelected ? 0 : 0.1}
                                                BorderSizePixel={0}
                                                Size={new UDim2(0, 130, 1, -12)}
                                                Text={`${uuid.sub(1, 8)}…`}
                                                TextColor3={
                                                    isSelected
                                                        ? Color3.fromRGB(12, 16, 24)
                                                        : Color3.fromRGB(226, 238, 255)
                                                }
                                                TextScaled={true}
                                                FontFace={RobotoMono}
                                                Event={{
                                                    Activated: () => setSelectedUuid(uuid),
                                                }}
                                            >
                                                <uicorner CornerRadius={new UDim(0, 6)} />
                                                <uistroke
                                                    Thickness={1}
                                                    Color={
                                                        isSelected
                                                            ? Color3.fromRGB(111, 182, 255)
                                                            : Color3.fromRGB(58, 86, 142)
                                                    }
                                                    Transparency={isSelected ? 0 : 0.3}
                                                />
                                            </textbutton>
                                        );
                                    })
                                )}
                            </scrollingframe>
                        </frame>

                        {/* Price Input */}
                        <frame
                            BackgroundTransparency={1}
                            Size={new UDim2(1, 0, 0, 0)}
                            AutomaticSize={Enum.AutomaticSize.Y}
                        >
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Vertical}
                                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                                VerticalAlignment={Enum.VerticalAlignment.Top}
                                Padding={new UDim(0, 10)}
                            />

                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoMonoBold}
                                Size={new UDim2(1, 0, 0, 26)}
                                Text="Set Price"
                                TextColor3={Color3.fromRGB(204, 222, 255)}
                                TextScaled={true}
                                TextXAlignment={Enum.TextXAlignment.Left}
                            />

                            <textbox
                                BackgroundColor3={Color3.fromRGB(24, 32, 48)}
                                BorderSizePixel={0}
                                Size={new UDim2(1, 0, 0, 40)}
                                Text={price}
                                PlaceholderText="Enter price"
                                PlaceholderColor3={Color3.fromRGB(120, 140, 175)}
                                TextColor3={Color3.fromRGB(226, 238, 255)}
                                TextScaled={true}
                                FontFace={RobotoMono}
                                ClearTextOnFocus={false}
                                Event={{
                                    FocusLost: (textBox) => setPrice(textBox.Text),
                                }}
                            >
                                <uicorner CornerRadius={new UDim(0, 6)} />
                                <uistroke Thickness={1} Color={Color3.fromRGB(74, 140, 255)} Transparency={0.35} />
                            </textbox>
                        </frame>

                        {/* Listing Type Selection */}
                        <frame
                            BackgroundTransparency={1}
                            Size={new UDim2(1, 0, 0, 0)}
                            AutomaticSize={Enum.AutomaticSize.Y}
                        >
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Vertical}
                                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                                VerticalAlignment={Enum.VerticalAlignment.Top}
                                Padding={new UDim(0, 10)}
                            />

                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoMonoBold}
                                Size={new UDim2(1, 0, 0, 26)}
                                Text="Listing Type"
                                TextColor3={Color3.fromRGB(204, 222, 255)}
                                TextScaled={true}
                                TextXAlignment={Enum.TextXAlignment.Left}
                            />

                            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 44)}>
                                <uilistlayout
                                    FillDirection={Enum.FillDirection.Horizontal}
                                    HorizontalAlignment={Enum.HorizontalAlignment.Left}
                                    Padding={new UDim(0, 10)}
                                />

                                {(["buyout", "auction"] as ("buyout" | "auction")[]).map((mode) => {
                                    const isActive = listingType === mode;
                                    return (
                                        <textbutton
                                            key={`listing-mode-${mode}`}
                                            AutoButtonColor={false}
                                            BackgroundColor3={
                                                isActive ? Color3.fromRGB(55, 189, 255) : Color3.fromRGB(29, 39, 59)
                                            }
                                            BackgroundTransparency={isActive ? 0 : 0.1}
                                            BorderSizePixel={0}
                                            Size={new UDim2(0, 140, 1, -8)}
                                            Text={mode === "buyout" ? "Buyout" : "Auction"}
                                            TextColor3={
                                                isActive ? Color3.fromRGB(12, 16, 24) : Color3.fromRGB(226, 238, 255)
                                            }
                                            TextScaled={true}
                                            FontFace={RobotoMono}
                                            Event={{
                                                Activated: () => setListingType(mode),
                                            }}
                                        >
                                            <uicorner CornerRadius={new UDim(0, 6)} />
                                            <uistroke
                                                Thickness={1}
                                                Color={
                                                    isActive
                                                        ? Color3.fromRGB(111, 182, 255)
                                                        : Color3.fromRGB(58, 86, 142)
                                                }
                                                Transparency={isActive ? 0 : 0.3}
                                            />
                                        </textbutton>
                                    );
                                })}
                            </frame>
                        </frame>

                        {/* Duration Input */}
                        <frame
                            BackgroundTransparency={1}
                            Size={new UDim2(1, 0, 0, 0)}
                            AutomaticSize={Enum.AutomaticSize.Y}
                        >
                            <uilistlayout
                                FillDirection={Enum.FillDirection.Vertical}
                                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                                VerticalAlignment={Enum.VerticalAlignment.Top}
                                Padding={new UDim(0, 10)}
                            />

                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoMonoBold}
                                Size={new UDim2(1, 0, 0, 26)}
                                Text="Duration (Days)"
                                TextColor3={Color3.fromRGB(204, 222, 255)}
                                TextScaled={true}
                                TextXAlignment={Enum.TextXAlignment.Left}
                            />

                            <textbox
                                BackgroundColor3={Color3.fromRGB(24, 32, 48)}
                                BorderSizePixel={0}
                                Size={new UDim2(1, 0, 0, 40)}
                                Text={duration}
                                PlaceholderText="7"
                                PlaceholderColor3={Color3.fromRGB(120, 140, 175)}
                                TextColor3={Color3.fromRGB(226, 238, 255)}
                                TextScaled={true}
                                FontFace={RobotoMono}
                                ClearTextOnFocus={false}
                                Event={{
                                    FocusLost: (textBox) => setDuration(textBox.Text),
                                }}
                            >
                                <uicorner CornerRadius={new UDim(0, 6)} />
                                <uistroke Thickness={1} Color={Color3.fromRGB(74, 140, 255)} Transparency={0.35} />
                            </textbox>
                        </frame>
                    </frame>
                </frame>

                {/* Submit Button */}
                <frame BackgroundTransparency={1} Size={new UDim2(0.9, 0, 0, 70)}>
                    <ActionButton
                        text="Create Listing"
                        backgroundColor={Color3.fromRGB(55, 189, 255)}
                        onClick={handleSubmit}
                    />
                </frame>
            </scrollingframe>
        </frame>
    );
}
