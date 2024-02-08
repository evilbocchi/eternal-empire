import { Currency } from "shared/constants";
import InfiniteMath from "./utils/infinitemath/InfiniteMath";

class Price {

    static FORMAT: {[currency in Currency]?: string} = {
        Funds: "$%s",
        Power: "%s W",
    }

    static COLORS: {[currency in Currency]?: Color3} = {
        Funds: Color3.fromRGB(0, 170, 0),
        Power: Color3.fromRGB(255, 102, 0)
    }

    static getFormatted(currency: Currency, cost?: InfiniteMath, excludeName?: boolean) {
        const format = Price.FORMAT[currency];
        let c = tostring(cost);
        if (cost?.lt(1)) {
            c = c.sub(1, 4);
        }
        if (format !== undefined)
            return format.format(c);
        return excludeName === true ? c : c + " " + currency;
    }

    costPerCurrency = new Map<Currency, InfiniteMath>();

    constructor() {

    }

    getCost(currency: Currency) {
        return this.costPerCurrency.get(currency);
    }

    setCost(currency: Currency, cost: InfiniteMath) {
        this.costPerCurrency.set(currency, cost);
        return this;
    }

    tostring(currency?: Currency, cost?: InfiniteMath) {
        if (currency !== undefined) {
            return Price.getFormatted(currency, cost ? cost : this.getCost(currency));
        }
        let priceLabel = "";
        let i = 1;
        const size = this.costPerCurrency.size();
        for (const [currency, cost] of this.costPerCurrency) {
            priceLabel += this.tostring(currency, cost);
            if (i < size) {
                priceLabel += ", ";
            }
            i += 1;
        }
        return priceLabel;
    }

    add(value: Price) {
        const newPrice = new Price();
        const def = new InfiniteMath(0);
        for (const [currency, cost] of pairs(this.costPerCurrency)) {
            newPrice.setCost(currency as Currency, cost.add(value.getCost(currency) ?? def));
        }
        return newPrice;
    }

    sub(value: Price) {
        const newPrice = new Price();
        const def = new InfiniteMath(0);
        for (const [currency, cost] of pairs(this.costPerCurrency)) {
            newPrice.setCost(currency as Currency, cost.sub(value.getCost(currency) ?? def));
        }
        return newPrice;
    }

    mul(value: Price | number) {
        const isNum = typeOf(value) === "number";
        const newPrice = new Price();
        const def = new InfiniteMath(1);
        for (const [currency, cost] of pairs(this.costPerCurrency)) {
            newPrice.setCost(currency as Currency, cost.mul((isNum ? new InfiniteMath(value as number) : (value as Price).getCost(currency)) ?? def));
        }
        return newPrice;
    }
}

export = Price;