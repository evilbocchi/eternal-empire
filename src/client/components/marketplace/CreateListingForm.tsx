import React, { useEffect, useMemo, useRef, useState } from "@rbxts/react";
import {
    createInventorySlot,
    updateInventorySlot,
    type InventorySlotHandle,
} from "client/components/item/inventory/InventorySlot";
import { ActionButton } from "client/components/marketplace/ListingCard";
import { showErrorToast } from "client/components/toast/ToastService";
import useProperty from "client/hooks/useProperty";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMono, RobotoMonoBold } from "shared/asset/GameFonts";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

export default function CreateListingForm({ onSubmit }: { onSubmit: (uuid: string, price: number) => boolean }) {
    const [selectedUuid, setSelectedUuid] = useState("");
    const [price, setPrice] = useState("");
    const availableInstances = useProperty(Packets.uniqueInstances);
    const slotHandlesRef = useRef(new Map<string, InventorySlotHandle>());

    useEffect(() => {
        // Find and destroy handles for items that are no longer available
        const toRemove = new Array<string>();
        for (const [uuid, handle] of slotHandlesRef.current) {
            if (!availableInstances.has(uuid)) {
                handle.destroy();
                toRemove.push(uuid);
            }
        }
    }, [availableInstances]);

    const handleSubmit = () => {
        if (selectedUuid === "") {
            showErrorToast("Please select an item to list.");
            playSound("Error.mp3");
            return;
        }

        if (price === "") {
            showErrorToast("Please enter a price.");
            playSound("Error.mp3");
            return;
        }

        const priceNum = tonumber(price);
        if (!priceNum || priceNum <= 0) {
            showErrorToast("Please enter a valid price.");
            playSound("Error.mp3");
            return;
        }

        const success = onSubmit(selectedUuid, priceNum);
        if (success) {
            playSound("Success.mp3");
        } else {
            playSound("Error.mp3");
        }

        // Reset form
        setSelectedUuid("");
        setPrice("");
    };

    // Memoize sorted instances by total pot value (descending)
    const sortedInstances = useMemo(() => {
        const arr = new Array<[string, UniqueItemInstance]>();
        for (const [uuid, uniqueInstance] of availableInstances) {
            arr.push([uuid, uniqueInstance]);
        }
        arr.sort((a, b) => {
            let aPotTotal = 0;
            for (const [, val] of a[1].pots) {
                aPotTotal += val;
            }
            let bPotTotal = 0;
            for (const [, val] of b[1].pots) {
                bPotTotal += val;
            }
            return bPotTotal < aPotTotal;
        });
        return arr;
    }, [availableInstances]);

    const availableInstanceElements = new Array<JSX.Element>();
    for (const [uuid, uniqueInstance] of sortedInstances) {
        const item = Items.getItem(uniqueInstance.baseItemId);
        if (!item) continue;

        const isSelected = selectedUuid === uuid;

        availableInstanceElements.push(
            <frame key={uuid} BackgroundTransparency={1} Size={new UDim2(0, 68, 0, 68)}>
                <frame
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 1, 0)}
                    ref={(rbx: Frame | undefined) => {
                        if (!rbx || slotHandlesRef.current.has(uuid)) return;

                        const handle = createInventorySlot(item, {
                            parent: rbx,
                            size: new UDim2(1, 0, 1, 0),
                            visible: true,
                            tooltip: true,
                            onActivated: () => {
                                playSound("Click.mp3");
                                setSelectedUuid(uuid);
                            },
                        });
                        // Hide the amount label for marketplace slots
                        handle.amountLabel.Visible = false;
                        updateInventorySlot(handle, {
                            amount: 1,
                            uuid: uuid,
                        });

                        slotHandlesRef.current.set(uuid, handle);
                    }}
                />
                {isSelected && (
                    <frame
                        key={`selection-indicator-${uuid}`}
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, 1, 0)}
                        ZIndex={10}
                    >
                        <uistroke Thickness={2} Color={Color3.fromRGB(55, 189, 255)} Transparency={0} />
                    </frame>
                )}
            </frame>,
        );
    }

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
            <uistroke Thickness={1} Color={Color3.fromRGB(58, 86, 142)} Transparency={0} />
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                VerticalAlignment={Enum.VerticalAlignment.Top}
                VerticalFlex={Enum.UIFlexAlignment.Fill}
                Padding={new UDim(0, 6)}
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

            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(1, 0, 0, 26)}
                Text="Select Item to List"
                TextColor3={Color3.fromRGB(204, 222, 255)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uiflexitem FlexMode={Enum.UIFlexMode.None} />
            </textlabel>

            <scrollingframe
                BackgroundColor3={Color3.fromRGB(24, 32, 48)}
                BorderSizePixel={0}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                ScrollBarThickness={6}
                ScrollBarImageColor3={Color3.fromRGB(74, 140, 255)}
                ScrollingDirection={Enum.ScrollingDirection.Y}
                Size={new UDim2(1, 0.5, 0, 0)}
            >
                <uistroke Thickness={1} Color={Color3.fromRGB(58, 86, 142)} Transparency={0.35} />
                <uipadding
                    PaddingTop={new UDim(0, 11)}
                    PaddingBottom={new UDim(0, 11)}
                    PaddingLeft={new UDim(0, 11)}
                    PaddingRight={new UDim(0, 11)}
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
                    <uigridlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        CellSize={new UDim2(0, 60, 0, 60)}
                        CellPadding={new UDim2(0, 16, 0, 16)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />
                )}

                {availableInstanceElements}
            </scrollingframe>

            {/* Price Input */}
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 40)}>
                <uipadding PaddingTop={new UDim(0, 14)} />
                <uiflexitem FlexMode={Enum.UIFlexMode.None} />
                <uilistlayout FillDirection={Enum.FillDirection.Horizontal} Padding={new UDim(0, 8)} />
                <textlabel
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Size={new UDim2(0, 0, 1, 0)}
                    Text="Your Price"
                    TextColor3={Color3.fromRGB(204, 222, 255)}
                    TextScaled={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                />
                <imagelabel
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                    Image={getAsset("assets/Diamond.png")}
                />
            </frame>

            <textbox
                BackgroundColor3={Color3.fromRGB(24, 32, 48)}
                BorderColor3={Color3.fromRGB(100, 100, 100)}
                BorderSizePixel={1}
                Size={new UDim2(1, 0, 0, 26)}
                PlaceholderText="Enter price in Diamonds"
                PlaceholderColor3={Color3.fromRGB(120, 140, 175)}
                TextColor3={Color3.fromRGB(226, 238, 255)}
                Text={price}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                FontFace={RobotoMono}
                ClearTextOnFocus={false}
                Event={{
                    FocusLost: (textBox) => setPrice(textBox.Text),
                }}
            >
                <uiflexitem FlexMode={Enum.UIFlexMode.None} />
                <uipadding
                    PaddingTop={new UDim(0, 4)}
                    PaddingBottom={new UDim(0, 4)}
                    PaddingLeft={new UDim(0, 8)}
                    PaddingRight={new UDim(0, 8)}
                />
            </textbox>

            {/* Submit Button */}
            <frame BackgroundTransparency={1} Size={new UDim2(0.7, 0, 0, 64)}>
                <uipadding PaddingTop={new UDim(0, 14)} />
                <uiflexitem FlexMode={Enum.UIFlexMode.None} />
                <ActionButton
                    text="Create Listing"
                    backgroundColor={Color3.fromRGB(55, 189, 255)}
                    onClick={handleSubmit}
                />
            </frame>
        </frame>
    );
}
