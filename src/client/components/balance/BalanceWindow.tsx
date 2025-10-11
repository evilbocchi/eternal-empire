import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import { OnoeNum } from "@rbxts/serikanum";
import BalanceOption, { balanceOptionImagePerCurrency } from "client/components/balance/BalanceOption";
import NavigationControls from "client/components/balance/NavigationControls";
import { useDocument } from "client/components/window/DocumentManager";
import useInterval from "client/hooks/useInterval";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import CurrencyBomb from "shared/currency/mechanics/CurrencyBomb";
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
    const navigationRef = useRef<Frame>();
    const [balance, setBalance] = useState<BaseCurrencyMap>(new Map());
    const [revenue, setRevenue] = useState<BaseCurrencyMap>(new Map());
    const [difference, setDifference] = useState<BaseCurrencyMap>(new Map());
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [bombBoosts, setBombBoosts] = useState<CurrencyBundle | undefined>(new CurrencyBundle());
    const { visible } = useDocument({ id: "Balance", priority: -1 });

    const openPosition = new UDim2(1, 0, 1, -70);
    const closePosition = openPosition.add(new UDim2(0, 250, 0, 0));
    useEffect(() => {
        if (visible) {
            wrapperRef.current?.TweenPosition(openPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 1, true);
        } else {
            wrapperRef.current?.TweenPosition(closePosition, Enum.EasingDirection.In, Enum.EasingStyle.Quad, 1, true);
        }
    }, [visible]);

    // Subscribe to balance and revenue updates
    useEffect(() => {
        const balanceConnection = Packets.balance.observe((newBalance) => {
            setBalance(newBalance);
        });

        const revenueConnection = Packets.revenue.observe((newRevenue) => {
            setRevenue(newRevenue);
        });

        const differenceConnection = Packets.showDifference.fromServer((diffPerCurrency) =>
            setDifference(diffPerCurrency),
        );

        return () => {
            balanceConnection.Disconnect();
            revenueConnection.Disconnect();
            differenceConnection.Disconnect();
        };
    }, []);

    useInterval(() => {
        setBombBoosts(CurrencyBomb.getBombBoosts(Packets.bombEndTimes.get(), os.time()));
        return 1;
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

    const currentCurrencies = getCurrentPageCurrencies();

    if (navigationRef.current) {
        balanceOptionImagePerCurrency.set("none", navigationRef.current);
    }

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

            <frame ref={navigationRef} BackgroundTransparency={1} LayoutOrder={-999} Size={new UDim2(1, 0, 0, 20)}>
                {/* Navigation Controls */}
                {maxPage > 1 ? (
                    <NavigationControls
                        currentPage={currentPage}
                        maxPage={maxPage}
                        currentPageName={CurrencyBundle.getCategory(currentPage) ?? "Main"}
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
                const incomeAmount = revenue.get(currency);
                const differenceAmount = difference.get(currency);
                let amount = currencyBalance === undefined ? undefined : new OnoeNum(currencyBalance);
                if (amount === undefined || amount.lessEquals(0)) {
                    amount = new OnoeNum(0);
                }

                return (
                    <BalanceOption
                        key={currency}
                        currency={currency}
                        amount={amount}
                        income={incomeAmount ? new OnoeNum(incomeAmount) : undefined}
                        difference={differenceAmount ? new OnoeNum(differenceAmount) : undefined}
                        bombBoost={bombBoosts?.get(currency)}
                        layoutOrder={index}
                    />
                );
            })}

            <uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 20)} />
        </frame>
    );
}
