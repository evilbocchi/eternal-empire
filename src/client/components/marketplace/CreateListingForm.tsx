import React, { Fragment, useEffect, useState } from "@rbxts/react";
import { ActionButton } from "client/components/marketplace/ListingCard";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import Items from "shared/items/Items";
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
    const [availableInstances, setAvailableInstances] = useState<Map<string, UniqueItemInstance>>(new Map());

    // Load player's available unique items
    useEffect(() => {
        const uniqueInstances = Packets.uniqueInstances.get() ?? new Map();
        const instances = new Map<string, UniqueItemInstance>();
        for (const [uuid, uniqueInstance] of uniqueInstances) {
            // Only include items that aren't placed
            if (!uniqueInstance.placed) {
                instances.set(uuid, uniqueInstance);
            }
        }
        setAvailableInstances(instances);
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

    const availableInstanceElements = new Array<JSX.Element>();

    for (const [uuid, uniqueInstance] of availableInstances) {
        const isSelected = selectedUuid === uuid;
        availableInstanceElements.push(
            <textbutton
                BackgroundColor3={isSelected ? Color3.fromRGB(55, 189, 255) : Color3.fromRGB(29, 39, 59)}
                BackgroundTransparency={isSelected ? 0 : 0.1}
                BorderSizePixel={0}
                Size={new UDim2(0, 130, 1, -12)}
                Text={Items.getItem(uniqueInstance.baseItemId)?.name ?? "Unknown Item"}
                TextColor3={isSelected ? Color3.fromRGB(12, 16, 24) : Color3.fromRGB(226, 238, 255)}
                TextScaled={true}
                FontFace={RobotoMono}
                Event={{
                    Activated: () => setSelectedUuid(uuid),
                }}
            >
                <uistroke
                    Thickness={1}
                    Color={isSelected ? Color3.fromRGB(111, 182, 255) : Color3.fromRGB(58, 86, 142)}
                    Transparency={isSelected ? 0 : 0.3}
                />
            </textbutton>,
        );
    }

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
            <scrollingframe
                BackgroundColor3={Color3.fromRGB(18, 24, 36)}
                BorderSizePixel={0}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                CanvasSize={new UDim2(1, 0, 0, 0)}
                ScrollBarThickness={6}
                ScrollBarImageColor3={Color3.fromRGB(74, 140, 255)}
                Size={new UDim2(1, 0, 1, 0)}
            >
                <uistroke Thickness={1} Color={Color3.fromRGB(58, 86, 142)} Transparency={0} />
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                    Padding={new UDim(0, 18)}
                />

                {/* Helper to render card wrapper */}
                <uigradient
                    Rotation={0}
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(20, 26, 39)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(12, 15, 24)),
                        ])
                    }
                />

                <uipadding
                    PaddingTop={new UDim(0, 16)}
                    PaddingBottom={new UDim(0, 16)}
                    PaddingLeft={new UDim(0, 18)}
                    PaddingRight={new UDim(0, 18)}
                />

                {/* Item Selection */}
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y}>
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
                    />

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

                        {availableInstances.isEmpty() ? (
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
                            <Fragment />
                        )}

                        {availableInstanceElements}
                    </scrollingframe>
                </frame>

                {/* Price Input */}
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y}>
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
                        BorderColor3={Color3.fromRGB(100, 100, 100)}
                        BorderSizePixel={1}
                        Size={new UDim2(1, 0, 0, 26)}
                        Text={price}
                        PlaceholderText="Enter price in Diamonds"
                        PlaceholderColor3={Color3.fromRGB(120, 140, 175)}
                        TextColor3={Color3.fromRGB(226, 238, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        FontFace={RobotoMono}
                        ClearTextOnFocus={false}
                        Event={{
                            FocusLost: (textBox) => setPrice(textBox.Text),
                        }}
                    >
                        <uipadding
                            PaddingTop={new UDim(0, 4)}
                            PaddingBottom={new UDim(0, 4)}
                            PaddingLeft={new UDim(0, 8)}
                            PaddingRight={new UDim(0, 8)}
                        />
                    </textbox>
                </frame>

                {/* Listing Type Selection */}
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y}>
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
                                    TextColor3={isActive ? Color3.fromRGB(12, 16, 24) : Color3.fromRGB(226, 238, 255)}
                                    TextScaled={true}
                                    FontFace={RobotoMono}
                                    Event={{
                                        Activated: () => setListingType(mode),
                                    }}
                                >
                                    <uistroke
                                        Thickness={1}
                                        Color={isActive ? Color3.fromRGB(111, 182, 255) : Color3.fromRGB(58, 86, 142)}
                                        Transparency={isActive ? 0 : 0.3}
                                    />
                                </textbutton>
                            );
                        })}
                    </frame>
                </frame>

                {/* Duration Input */}
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y}>
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
                        <uistroke Thickness={1} Color={Color3.fromRGB(74, 140, 255)} Transparency={0.35} />
                    </textbox>
                </frame>

                {/* Submit Button */}
                <frame BackgroundTransparency={1} Size={new UDim2(0.9, 0, 0, 50)}>
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
