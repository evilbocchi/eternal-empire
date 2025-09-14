import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import { MAIN_LAYOUT_GUI } from "client/controllers/core/ScreenGuis";
import BalanceOption from "client/ui/components/balance/BalanceOption";
import NavigationControls from "client/ui/components/balance/NavigationControls";
import { useWindow } from "client/ui/components/window/WindowManager";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Packets from "shared/Packets";

const ZERO = new OnoeNum(0);

/**
 * React component for displaying player currency balances with pagination support.
 *
 * Features:
 * - Displays all player currencies with their current amounts
 * - Shows income rates when available
 * - Pagination support for different currency categories
 * - Real-time updates via Packets observation
 * - Configurable formatting options
 */
export default function BalanceWindow() {
    const wrapperRef = useRef<Frame>();
    const [visible, setVisible] = useState(true);
    const [balance, setBalance] = useState<Map<Currency, BaseOnoeNum>>(new Map());
    const [revenue, setRevenue] = useState<Map<Currency, BaseOnoeNum>>(new Map());
    const [isSmallScreen, setIsSmallScreen] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);

    const openPosition = new UDim2(1, 0, 1, -70);
    const closePosition = openPosition.add(new UDim2(0, 250, 0, 0));
    useWindow({
        id: "Balance",
        visible,
        onOpen: () => {
            wrapperRef.current?.TweenPosition(openPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 1, true);
        },
        onClose: () => {
            wrapperRef.current?.TweenPosition(closePosition, Enum.EasingDirection.In, Enum.EasingStyle.Quad, 1, true);
        },
        priority: -1, // Negative priority so close hotkey does not work
    });

    // Subscribe to balance and revenue updates
    useEffect(() => {
        const balanceConnection = Packets.balance.observe((newBalance) => {
            setBalance(newBalance);
        });

        const revenueConnection = Packets.revenue.observe((newRevenue) => {
            setRevenue(newRevenue);
        });

        const sizeConnection = MAIN_LAYOUT_GUI.GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
            const size = MAIN_LAYOUT_GUI.AbsoluteSize;
            setIsSmallScreen(size.X < 1000);
        });

        return () => {
            balanceConnection.Disconnect();
            revenueConnection.Disconnect();
            sizeConnection.Disconnect();
        };
    }, []);

    // Calculate max pages and filter currencies
    useEffect(() => {
        let calculatedMaxPage = 1;
        for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
            if (details.page >= 999) continue; // Skip unobtainable/internal currencies
            const amount = balance.get(currency);
            if (amount === undefined || ZERO.moreEquals(amount)) continue; // Skip if no balance
            if (details.page !== undefined && details.page > calculatedMaxPage) {
                calculatedMaxPage = details.page;
            }
        }
        setMaxPage(calculatedMaxPage);

        // Reset to page 1 if we're on a page that no longer exists
        if (calculatedMaxPage === 1 && currentPage > 1) {
            setCurrentPage(1);
        }
    }, [balance, currentPage]);

    // Get currencies for current page
    const getCurrentPageCurrencies = (): Currency[] => {
        const currencies: Currency[] = [];
        for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
            const currencyBalance = balance.get(currency);
            const amount = new OnoeNum(currencyBalance ?? 0);

            // Show if currency has balance or is Funds (always shown) and is on current page
            const shouldShow = (!amount.lessEquals(0) || currency === "Funds") && currentPage === details.page;

            if (shouldShow) {
                currencies.push(currency);
            }
        }

        // Sort by layout order
        currencies.sort((a, b) => {
            const orderA = CURRENCY_DETAILS[a].layoutOrder ?? 0;
            const orderB = CURRENCY_DETAILS[b].layoutOrder ?? 0;
            return orderA < orderB;
        });

        return currencies;
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1) {
            setCurrentPage(maxPage);
        } else if (newPage > maxPage) {
            setCurrentPage(1);
        } else {
            setCurrentPage(newPage);
        }
    };

    const formatCurrency = (currency: Currency, amount: OnoeNum): string => {
        if (!isSmallScreen && Packets.settings.get()?.FormatCurrencies) {
            return CurrencyBundle.getFormatted(currency, amount, true);
        }
        return tostring(amount);
    };

    const getCurrentPageName = (): string => {
        return CurrencyBundle.getCategory(currentPage) ?? "Main";
    };

    const currentCurrencies = getCurrentPageCurrencies();

    return (
        <frame
            ref={wrapperRef}
            AnchorPoint={new Vector2(1, 1)}
            BackgroundTransparency={1}
            Position={closePosition}
            Size={new UDim2(0.025, 150, 0.5, -10)}
            ZIndex={-1}
        >
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Top}
            />

            <frame BackgroundTransparency={1} LayoutOrder={-999} Size={new UDim2(1, 0, 0, 20)}>
                {/* Navigation Controls */}
                {maxPage > 1 ? (
                    <NavigationControls
                        currentPage={currentPage}
                        maxPage={maxPage}
                        currentPageName={getCurrentPageName()}
                        onPageChange={handlePageChange}
                    />
                ) : (
                    <Fragment />
                )}

                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Right}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
            </frame>

            {/* Currency Options */}
            {currentCurrencies.map((currency, index) => {
                const currencyBalance = balance.get(currency);
                const amount = new OnoeNum(currencyBalance ?? 0);
                const incomeAmount = revenue.get(currency);
                const income = incomeAmount ? new OnoeNum(incomeAmount) : undefined;

                return (
                    <BalanceOption
                        key={currency}
                        currency={currency}
                        amount={amount}
                        income={income}
                        formatCurrency={formatCurrency}
                        layoutOrder={index}
                    />
                );
            })}

            <uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 20)} />
        </frame>
    );
}
