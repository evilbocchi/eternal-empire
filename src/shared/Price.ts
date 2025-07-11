import { Currency } from "shared/constants";
import InfiniteMath from "./utils/infinitemath/InfiniteMath";

class Price {

    static CATEGORIES = {
        Main: 1,
        Misc: 2
    }

    static DETAILS_PER_CURRENCY: {[currency in Currency]: {layoutOrder: number, format?: string, color: Color3, page?: number}} = {
        Funds: {
            layoutOrder: 1,
            format: "$%s",
            color: Color3.fromRGB(0, 170, 0),
            page: Price.CATEGORIES.Main
        },
        Power: {
            layoutOrder: 2,
            format: "%s W",
            color: Color3.fromRGB(255, 102, 0),
            page: Price.CATEGORIES.Main
        },
        Bitcoin: {
            layoutOrder: 3,
            format: "%s BTC",
            color: Color3.fromRGB(10, 207, 255),
            page: Price.CATEGORIES.Main
        },
        "Purifier Clicks": {
            layoutOrder: 99,
            color: Color3.fromRGB(156, 217, 255),
            page: Price.CATEGORIES.Misc
        }
    }

    static getCategory(page: number) {
        for (const [c, p] of pairs(Price.CATEGORIES)) {
            if (page === p) {
                return c;
            }
        }
        return undefined;
    }

    static getFormatted(currency: Currency, cost?: InfiniteMath, excludeName?: boolean) {
        const format = Price.DETAILS_PER_CURRENCY[currency].format;
        let c = tostring(cost);
        if (cost?.lt(1)) {
            c = c.sub(1, 4);
        }
        if (format !== undefined)
            return format.format(c);
        return excludeName === true ? c : c + " " + currency;
    }

    costPerCurrency = new Map<Currency, InfiniteMath>();

    constructor(costPerCurrency?: Map<Currency, InfiniteMath>) {
        if (costPerCurrency !== undefined) {
            const fixed = new Map<Currency, InfiniteMath>();
            for (const [currency, cost] of costPerCurrency) {
                fixed.set(currency, new InfiniteMath(cost));
            }
            this.costPerCurrency = fixed;
        }
    }

    getCost(currency: Currency) {
        return this.costPerCurrency.get(currency);
    }

    setCost(currency: Currency, cost: InfiniteMath | number) {
        this.costPerCurrency.set(currency, typeOf(cost) === "number" ? new InfiniteMath(cost) : (cost as InfiniteMath));
        return this;
    }

    tostring(currency?: Currency, cost?: InfiniteMath) {
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
            if (a !== undefined && b !== undefined) {
                newPrice.setCost(currency, a.add(b));
            }
            else if (a !== undefined) {
                newPrice.setCost(currency, a);
            }
            else if (b !== undefined) {
                newPrice.setCost(currency, b);
            }
        }
        return newPrice;
    }

    sub(value: Price) {
        const newPrice = new Price();
        const def = new InfiniteMath(0);
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
        const def = new InfiniteMath(1);
        for (const [currency, cost] of pairs(this.costPerCurrency)) {
            newPrice.setCost(currency as Currency, cost.mul((isNum ? new InfiniteMath(value as number) : ((value as Price).getCost(currency)) ?? def)));
        }
        return newPrice;
    }
}

export = Price;