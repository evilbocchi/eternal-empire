declare global {
    type Currency = keyof (typeof details);
    type CurrencyDetails = Combine<typeof details[Currency]>;
}

export const CURRENCY_CATEGORIES = {
    Main: 1,
    Misc: 2
};

/**
 * Metadata about each currency.
 */
const details = {
    Funds: {
        layoutOrder: 1,
        format: "$%s",
        color: Color3.fromRGB(0, 200, 0),
        image: 17574921441,
        page: CURRENCY_CATEGORIES.Main
    },
    Power: {
        layoutOrder: 2,
        format: "%s W",
        color: Color3.fromRGB(255, 102, 0),
        image: 17574930060,
        page: CURRENCY_CATEGORIES.Main
    },
    Bitcoin: {
        layoutOrder: 3,
        format: "%s BTC",
        color: Color3.fromRGB(10, 207, 255),
        image: 17574930341,
        page: CURRENCY_CATEGORIES.Main
    },

    Skill: {
        layoutOrder: 100,
        color: Color3.fromRGB(138, 255, 128),
        image: 17574929706,
        page: CURRENCY_CATEGORIES.Main
    },
    Wins: {
        layoutOrder: 101,
        color: Color3.fromRGB(80, 57, 255),
        image: 83031811545708,
        page: CURRENCY_CATEGORIES.Main
    },

    "Purifier Clicks": {
        layoutOrder: 1000,
        color: Color3.fromRGB(156, 217, 255),
        image: 17574929896,
        page: CURRENCY_CATEGORIES.Misc
    },
    "Dark Matter": {
        layoutOrder: 1001,
        color: Color3.fromRGB(125, 0, 130),
        image: 17574930185,
        page: CURRENCY_CATEGORIES.Misc
    },
    Parts: {
        layoutOrder: 1002,
        color: Color3.fromRGB(237, 255, 69),
        image: 114592102522331,
        page: CURRENCY_CATEGORIES.Misc
    },
    Health: {
        layoutOrder: 1003,
        color: Color3.fromRGB(255, 0, 0),
        image: 17574930668,
        page: CURRENCY_CATEGORIES.Misc
    },
    Stamina: {
        layoutOrder: 1004,
        color: Color3.fromRGB(255, 222, 74),
        image: 111761735343897,
        page: CURRENCY_CATEGORIES.Misc
    },

    "Funds Bombs": {
        layoutOrder: 10000,
        color: Color3.fromRGB(0, 140, 97),
        image: 13623679087,
        page: CURRENCY_CATEGORIES.Misc
    },
};

export const CURRENCY_DETAILS = details as { [currency in Currency]: CurrencyDetails };

export const CURRENCIES = (() => {
    const currencies = new Array<Currency>();
    for (const [currency] of pairs(CURRENCY_DETAILS))
        currencies.push(currency);
    return currencies;
})();