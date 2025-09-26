import { OnoeNum } from "@antivivi/serikanum";
import React, { useMemo, useRef } from "@rbxts/react";
import { TextService } from "@rbxts/services";
import displayBalanceCurrency from "client/components/balance/displayBalanceCurrency";
import { useItemViewport } from "client/components/item/useCIViewportManagement";
import { RobotoSlabHeavy } from "client/GameFonts";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import Items from "shared/items/Items";

type RowItemInfo = {
    text: string;
    currency?: Currency;
    item?: Item;
    width: number;
    height: number;
    position?: UDim2;
    size?: UDim2;
};

const OPTION_BETWEEN_PADDING = 4;
const OPTION_X_PADDING = 10;
const OPTION_Y_PADDING = 1;

const GET_TEXT_BOUNDS_PARAMS = new Instance("GetTextBoundsParams");
GET_TEXT_BOUNDS_PARAMS.Font = RobotoSlabHeavy;

function PriceOption({
    currency,
    item,
    text,
    affordable,
    viewportManagement,
    position,
    width,
    height = 25,
}: {
    /** Currency amount and type */
    currency?: Currency;
    /** Item amount and type */
    item?: Item;
    text: string;
    /** Whether the price is affordable */
    affordable: boolean;
    /** Shared viewport management instance */
    viewportManagement?: ItemViewportManagement;
    /** Position of the price option */
    position?: UDim2;
    /** Width of the price option */
    width: number;
    /** Height of the price option */
    height?: number;
}) {
    const viewportRef = useRef<ViewportFrame>();
    const textColor = affordable ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(255, 80, 80);
    if (item) {
        useItemViewport(viewportRef, item.id, viewportManagement);
    }

    return (
        <frame BackgroundTransparency={1} Position={position} Size={new UDim2(0, width, 0, height)}>
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, OPTION_BETWEEN_PADDING)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <uipadding
                PaddingBottom={new UDim(0, OPTION_Y_PADDING)}
                PaddingTop={new UDim(0, OPTION_Y_PADDING)}
                PaddingLeft={new UDim(0, OPTION_X_PADDING)}
                PaddingRight={new UDim(0, OPTION_X_PADDING)}
            />

            {currency && (
                <imagelabel
                    BackgroundTransparency={1}
                    Image={CURRENCY_DETAILS[currency].image}
                    ScaleType={Enum.ScaleType.Fit}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
            )}

            {item && (
                <viewportframe
                    ref={viewportRef}
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
            )}

            <textlabel
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(0, 0, 1, 0)}
                Text={text}
                TextColor3={textColor}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2} />
            </textlabel>
        </frame>
    );
}

export function WrappingPriceOptions({
    priceOptionHeight = 25,
    padding = 5,
    price,
    requiredItems,
    viewportManagement,
    affordablePerCurrency,
    affordablePerItemId,
}: {
    priceOptionHeight?: number;
    padding?: number;
    price: CurrencyBundle;
    requiredItems: Map<string, number>;
    viewportManagement?: ItemViewportManagement;
    affordablePerCurrency: Map<Currency, boolean>;
    affordablePerItemId: Map<string, boolean>;
}) {
    const ref = useRef<Frame>();
    const containerXPixels = ref.current?.AbsoluteSize.X;

    // Create a unique key based on price and required items to force re-render when they change
    const priceKey = useMemo(() => {
        const currencyKey = price.amountPerCurrency.isEmpty()
            ? ""
            : [...price.amountPerCurrency].map(([c, a]) => `${c}:${a.toString()}`).join(",");
        const itemKey = requiredItems.size() === 0 ? "" : [...requiredItems].map(([i, a]) => `${i}:${a}`).join(",");
        return `${currencyKey}|${itemKey}`;
    }, [price, requiredItems]);

    if (containerXPixels === undefined)
        return <frame key={priceKey} ref={ref} BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)} />;

    const getText = (currency: Currency | undefined, item: Item | undefined, amount: OnoeNum | number) => {
        return currency ? displayBalanceCurrency(currency, amount as OnoeNum) : `${amount} ${item?.name}`;
    };

    const sortedInfos = new Array<{ text: string; currency?: Currency; item?: Item }>();
    for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
        const amount = price.amountPerCurrency.get(currency);
        if (amount === undefined) continue;
        sortedInfos.push({ text: getText(currency, undefined, amount), currency });
    }
    for (const requiredItem of Items.sortedItems) {
        const amount = requiredItems.get(requiredItem.id);
        if (amount === undefined) continue;
        sortedInfos.push({ text: getText(undefined, requiredItem, amount), item: requiredItem });
    }

    // Account for the button's left and right padding
    const availableWidth = containerXPixels - padding * 2;

    // Early return if no price options are available yet
    if (sortedInfos.size() === 0) return;

    // First pass: organize options into rows
    const rows: Array<Array<RowItemInfo>> = [];
    let currentRow: Array<RowItemInfo> = [];
    let currentRowWidth = 0;

    GET_TEXT_BOUNDS_PARAMS.Size = priceOptionHeight;
    GET_TEXT_BOUNDS_PARAMS.Width = 1000; // Arbitrary large width to avoid wrapping

    for (const info of sortedInfos) {
        GET_TEXT_BOUNDS_PARAMS.Text = info.text;
        const textSize = TextService.GetTextBoundsAsync(GET_TEXT_BOUNDS_PARAMS);
        const sizeX = priceOptionHeight + OPTION_BETWEEN_PADDING + textSize.X + OPTION_X_PADDING * 2;
        const sizeY = textSize.Y + OPTION_Y_PADDING * 2;

        // Skip instances that haven't been sized yet
        if (sizeX === 0 || sizeY === 0) continue;

        // Check if this option fits in the current row
        const neededWidth = currentRowWidth + sizeX + (currentRow.size() > 0 ? padding : 0);
        if (neededWidth > availableWidth && currentRow.size()) {
            // Start a new row
            rows.push(currentRow);
            currentRow = [{ ...info, width: sizeX, height: sizeY }];
            currentRowWidth = sizeX;
        } else {
            // Add to current row
            currentRow.push({ ...info, width: sizeX, height: sizeY });
            currentRowWidth = neededWidth;
        }
    }
    if (currentRow.size() > 0) {
        rows.push(currentRow);
    }

    // Second pass: position options with distributed widths
    let currentY = 0;
    const infos = new Array<RowItemInfo>();
    for (const row of rows) {
        if (row.size() === 0) continue;

        // Calculate total original width used by this row
        const totalOriginalWidth = row.reduce((sum, item) => sum + item.width, 0);
        const totalPadding = (row.size() - 1) * padding;
        const usedWidth = totalOriginalWidth + totalPadding;
        const excessWidth = availableWidth - usedWidth + padding * 2;
        const widthPerOption = excessWidth / row.size();

        // Position and resize options in this row
        let currentX = 0;
        for (const info of row) {
            const newWidth = info.width + widthPerOption;
            info.position = new UDim2(0, currentX, 0, currentY);
            info.size = new UDim2(0, newWidth, 0, info.height);
            currentX += newWidth + padding;
            infos.push(info);
        }

        currentY += row[0].height + padding;
    }
    const totalPriceOptions = infos.size();

    return (
        <frame
            key={priceKey}
            ref={ref}
            BackgroundTransparency={1}
            Size={new UDim2(1, 0, 0, rows.size() * priceOptionHeight)}
        >
            {infos.map((info) => {
                const affordable = info.currency
                    ? (affordablePerCurrency.get(info.currency) ?? false)
                    : info.item
                      ? (affordablePerItemId.get(info.item.id) ?? false)
                      : false;

                return (
                    <frame
                        BackgroundColor3={new Color3()}
                        BackgroundTransparency={totalPriceOptions > 1 ? 0.8 : 1}
                        Position={info.position}
                        Size={info.size}
                    >
                        <uicorner CornerRadius={new UDim(0, 5)} />
                        <uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Center} />
                        <PriceOption
                            affordable={affordable}
                            currency={info.currency}
                            item={info.item}
                            text={info.text}
                            width={info.width}
                            viewportManagement={viewportManagement}
                        />
                    </frame>
                );
            })}
        </frame>
    );
}
