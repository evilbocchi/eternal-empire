import { getAsset } from "shared/asset/AssetMap";

declare global {
    /**
     * Represents a currency in the game.
     * Each currency has specific details such as layout order that can be obtained from {@link CURRENCY_DETAILS}.
     */
    type Currency = keyof typeof details;

    /**
     * Represents the details of a currency, including its layout order, format, color, image, and page.
     */
    type CurrencyDetails = Combine<(typeof details)[Currency]>;
}

export const CURRENCY_CATEGORIES = {
    Main: 1,
    Misc: 2,
    Premium: 3,
    Internal: 999,
};

/**
 * Metadata about each currency.
 */
const details = {
    Time: {
        description: "The time you own.",
        layoutOrder: 0,
        color: Color3.fromRGB(170, 0, 255),
        image: getAsset("assets/Time.png"),
        page: CURRENCY_CATEGORIES.Main,
    },
    Funds: {
        description: "The main currency used for most purchases and transactions.",
        layoutOrder: 1,
        format: "$%s",
        color: Color3.fromRGB(0, 200, 0),
        image: getAsset("assets/Funds.png"),
        page: CURRENCY_CATEGORIES.Main,
    },
    Power: {
        description: "A currency used to power certain items and abilities.",
        layoutOrder: 2,
        format: "%s W",
        color: Color3.fromRGB(255, 102, 0),
        image: getAsset("assets/Power.png"),
        page: CURRENCY_CATEGORIES.Main,
    },
    Bitcoin: {
        description: "A virtual currency that can be mined and used for special rewards.",
        layoutOrder: 3,
        format: "%s BTC",
        color: Color3.fromRGB(10, 207, 255),
        image: getAsset("assets/Bitcoin.png"),
        page: CURRENCY_CATEGORIES.Main,
    },

    Skill: {
        description: "The prime measure of an Obbyist's ability.",
        layoutOrder: 100,
        color: Color3.fromRGB(138, 255, 128),
        image: getAsset("assets/Skill.png"),
        page: CURRENCY_CATEGORIES.Main,
    },
    Wins: {
        description: "A tally of success.",
        layoutOrder: 101,
        color: Color3.fromRGB(80, 57, 255),
        image: getAsset("assets/Wins.png"),
        page: CURRENCY_CATEGORIES.Main,
    },

    "Difficulty Power": {
        description: "Your very rank in the world of Obbysia.",
        layoutOrder: 999,
        color: Color3.fromRGB(255, 0, 255),
        image: getAsset("assets/DifficultyPower.png"),
        page: CURRENCY_CATEGORIES.Misc,
    },
    "Purifier Clicks": {
        description: "The number of times you've clicked the Awesome Manumatic Purifier.",
        layoutOrder: 1000,
        color: Color3.fromRGB(156, 217, 255),
        image: getAsset("assets/PurifierClicks.png"),
        page: CURRENCY_CATEGORIES.Misc,
    },
    "Dark Matter": {
        description: "A mysterious substance with unknown properties...",
        layoutOrder: 1001,
        color: Color3.fromRGB(125, 0, 130),
        image: getAsset("assets/DarkMatter.png"),
        page: CURRENCY_CATEGORIES.Misc,
    },
    Parts: {
        description: "Components used in crafting and building.",
        layoutOrder: 1002,
        color: Color3.fromRGB(237, 255, 69),
        image: getAsset("assets/Part.png"),
        page: CURRENCY_CATEGORIES.Misc,
    },
    "Obby Points": {
        description: "Points earned by completing Obby challenges.",
        layoutOrder: 1003,
        color: Color3.fromRGB(255, 128, 0),
        image: getAsset("assets/ObbyPoint.png"),
        page: CURRENCY_CATEGORIES.Misc,
    },
    Health: {
        layoutOrder: 1003,
        color: Color3.fromRGB(255, 0, 0),
        image: getAsset("assets/Health.png"),
        page: CURRENCY_CATEGORIES.Internal,
    },
    Stamina: {
        layoutOrder: 1004,
        color: Color3.fromRGB(255, 222, 74),
        image: getAsset("assets/Stamina.png"),
        page: CURRENCY_CATEGORIES.Internal,
    },

    Diamonds: {
        description: "A premium currency used for unique items and perks.",
        layoutOrder: 1005,
        color: Color3.fromRGB(140, 255, 245),
        image: getAsset("assets/Diamond.png"),
        page: CURRENCY_CATEGORIES.Premium,
    },
    "Funds Bombs": {
        description: "Redeem a Funds Bomb for a GLOBAL boost!",
        layoutOrder: 10000,
        color: Color3.fromRGB(0, 140, 97),
        image: getAsset("assets/FundsBomb.png"),
        page: CURRENCY_CATEGORIES.Premium,
    },
    "Power Bombs": {
        description: "Redeem a Power Bomb for a GLOBAL boost!",
        layoutOrder: 10001,
        color: Color3.fromRGB(255, 69, 0),
        image: getAsset("assets/PowerBomb.png"),
        page: CURRENCY_CATEGORIES.Premium,
    },
};

export const CURRENCY_DETAILS = details as { [currency in Currency]: CurrencyDetails };

export const CURRENCIES = (() => {
    const currencies = new Array<Currency>();
    for (const [currency] of pairs(CURRENCY_DETAILS)) currencies.push(currency);
    return currencies;
})();
