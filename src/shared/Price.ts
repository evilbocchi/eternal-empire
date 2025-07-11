//!native
import { OnoeNum } from "@antivivi/serikanum";

declare global {
    type Currency = "Funds" | "Power" | "Bitcoin" | "Purifier Clicks" | "Skill" | "Dark Matter" | "Funds Bombs";
}

const def = new OnoeNum(1);

/**
 * Utility class for combining multiple currencies into a single instance.
 * Usually helpful in keeping track and applying formulas on. An example would be a simple droplet upgrader below:
 * ```
 * let dropletValue = new Price().setCost("Funds", 50); // Initial droplet value
 * dropletValue = dropletValue.mul(2); // Multiply all currencies by 2
 * dropletValue = dropletValue.mul(new Price().setCost("Funds", 2)); // Only multiply Funds by 2
 * return dropletValue; // Pass the value to be used in other modules, e.g. adding to balance
 * ```
 */
class Price {

    /**
     * Page number for each category name.
     */
    static CATEGORIES = {
        Main: 1,
        Misc: 2
    }

    static DETAILS_PER_CURRENCY: {[currency in Currency]: {layoutOrder: number, format?: string, color: Color3, image: number, page?: number}} = {
        Funds: {
            layoutOrder: 1,
            format: "$%s",
            color: Color3.fromRGB(0, 200, 0),
            image: 17574921441,
            page: Price.CATEGORIES.Main
        },
        Power: {
            layoutOrder: 2,
            format: "%s W",
            color: Color3.fromRGB(255, 102, 0),
            image: 17574930060,
            page: Price.CATEGORIES.Main
        },
        Bitcoin: {
            layoutOrder: 3,
            format: "%s BTC",
            color: Color3.fromRGB(10, 207, 255),
            image: 17574930341,
            page: Price.CATEGORIES.Main
        },

        Skill: {
            layoutOrder: 100,
            color: Color3.fromRGB(138, 255, 128),
            image: 17574929706,
            page: Price.CATEGORIES.Main
        },
        "Purifier Clicks": {
            layoutOrder: 1000,
            color: Color3.fromRGB(156, 217, 255),
            image: 17574929896,
            page: Price.CATEGORIES.Misc
        },
        "Dark Matter": {
            layoutOrder: 1001,
            color: Color3.fromRGB(125, 0, 130),
            image: 17574930185,
            page: Price.CATEGORIES.Misc
        },
        "Funds Bombs": {
            layoutOrder: 1002,
            color: Color3.fromRGB(0, 140, 97),
            image: 13623679087,
            page: Price.CATEGORIES.Misc
        },
    }

    /**
     * Returns the page name for the specified index.
     * 
     * @param page Index number for page
     * @returns Page name in string
     */
    static getCategory(page: number) {
        for (const [c, p] of pairs(Price.CATEGORIES)) {
            if (page === p) {
                return c;
            }
        }
        return undefined;
    }

    /**
     * Formats the specified cost using the specified currency's format string.
     * If no format is available for the currency, it will instead default to the format ```"<value> <currency>"```.
     * ```
     * print(Price.getFormatted("Funds", new OnoeNum(5120))) // Output: $5.12K
     * ```
     * 
     * @param currency Currency to use to format
     * @param cost Cost to format
     * @param excludeName Whether to exclude ```<currency>``` in the default format. If left blank, does not exclude
     * @returns Formatted string version of the cost
     */
    static getFormatted(currency: Currency, cost?: OnoeNum, excludeName?: boolean) {
        const format = Price.DETAILS_PER_CURRENCY[currency].format;
        const c = tostring(cost);
        if (format !== undefined)
            return format.format(c);
        return excludeName === true ? c : `${c} ${currency}`;
    }

    costPerCurrency = new Map<Currency, OnoeNum>();

    constructor(costPerCurrency?: Map<Currency, OnoeNum>) {
        if (costPerCurrency !== undefined) {
            const fixed = new Map<Currency, OnoeNum>();
            for (const [currency, cost] of costPerCurrency) {
                fixed.set(currency, new OnoeNum(cost));
            }
            this.costPerCurrency = fixed;
        }
    }

    getCost(currency: Currency) {
        return this.costPerCurrency.get(currency);
    }

    setCost(currency: Currency, cost?: OnoeNum | number) {
        if (cost === undefined) {
            this.costPerCurrency.delete(currency);
            return this;
        }
        this.costPerCurrency.set(currency, typeOf(cost) === "number" ? new OnoeNum(cost) : (cost as OnoeNum));
        return this;
    }

    /**
     * Concatenates all formatted costs in the instance to a human-readable string that can be used
     * in displaying the prices of items, droplet boosts, etc.
     * Note that the order in which currencies are shown is determined based on their layout order.
     * ```
     * print(new Price().setCost("Funds", 100).setCost("Power", 5).tostring()) // Output: $100, 5 W
     * ```
     * 
     * @param currency A currency to format into a string. Omit this to format all currencies in the instance.
     * @param cost The cost of the specified currency. Omit this to use the cost in the instance instead.
     * @returns A formatted huamn-readable string of the Price instance
     */
    tostring(currency?: Currency, cost?: OnoeNum) {
        if (currency !== undefined) {
            return Price.getFormatted(currency, cost ? cost : this.getCost(currency));
        }
        let priceLabel = "";
        let i = 1;
        const size = this.costPerCurrency.size();
        for (const [c] of pairs(Price.DETAILS_PER_CURRENCY)) {
            const cc = this.getCost(c);
            if (cc !== undefined) {
                priceLabel += this.tostring(c, cc);
                if (i < size) {
                    priceLabel += ", ";
                }
                i++;
            }
        }
        return priceLabel;
    }

    add(value: Price) {
        const newPrice = new Price();
        for (const [currency] of pairs(Price.DETAILS_PER_CURRENCY)) {
            const a = this.getCost(currency);
            const b = value.getCost(currency);
            if (a === undefined) {
                if (b === undefined)
                    continue;
                else
                    newPrice.setCost(currency, b);
            }
            else {
                if (b === undefined)
                    newPrice.setCost(currency, a);
                else
                    newPrice.setCost(currency, a.add(b));
            }
        }
        return newPrice;
    }

    sub(value: Price) {
        const newPrice = new Price();
        const def = new OnoeNum(0);
        for (const [currency] of pairs(Price.DETAILS_PER_CURRENCY)) {
            const a = this.getCost(currency);
            const b = value.getCost(currency);
            if (a !== undefined && b !== undefined) {
                newPrice.setCost(currency, a.sub(b));
            }
            else if (a !== undefined) {
                newPrice.setCost(currency, a);
            }
            else if (b !== undefined) {
                newPrice.setCost(currency, def.sub(b));
            }
        }
        return newPrice;
    }

    mul(value: Price | number) {
        const isNum = typeOf(value) === "number";
        const newPrice = new Price();
        for (const [currency, cost] of pairs(this.costPerCurrency)) {
            newPrice.setCost(currency as Currency, cost.mul((isNum ? new OnoeNum(value as number) : ((value as Price).getCost(currency)) ?? def)));
        }
        return newPrice;
    }
}

export = Price;