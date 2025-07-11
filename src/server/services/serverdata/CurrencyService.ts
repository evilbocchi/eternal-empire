import { OnStart, Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";
import Price from "shared/Price";
import { Fletchette, RemoteProperty, Signal } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

declare global {
    interface FletchetteCanisters {
        CurrencyCanister: typeof CurrencyCanister;
    }
}

export const CurrencyCanister = Fletchette.createCanister("CurrencyCanister", {
    balance: new RemoteProperty<Map<Currency, InfiniteMath>>(new Map(), false),
    mostBalance: new RemoteProperty<Map<Currency, InfiniteMath>>(new Map(), false),
});

@Service()
export class CurrencyService implements OnStart {
    balanceChanged = new Signal<(balance: Map<Currency, InfiniteMath>) => void>();

    constructor(private dataService: DataService) {
        
    }

    getCost(currency: Currency) {
        return new InfiniteMath(this.dataService.empireProfile?.Data.currencies.get(currency) ?? 0);
    }

    setCost(currency: Currency, cost: InfiniteMath | undefined, dontPropagateToClient?: boolean) {
        const profile = this.dataService.empireProfile;
        if (profile !== undefined) {
            if (cost === undefined) {
                profile.Data.currencies.delete(currency);
            }
            else {
                profile.Data.currencies.set(currency, cost.lt(0) ? new InfiniteMath(0) : cost);
            }
            if (dontPropagateToClient !== true) {
                const balance = profile.Data.currencies;
                CurrencyCanister.balance.set(balance);
                this.balanceChanged.fire(balance);
            }
        }
    }

    incrementCost(currency: Currency, cost: InfiniteMath) {
        const c = this.getCost(currency);
        if (c !== undefined) {
            this.setCost(currency, c.add(cost));
        }
    }

    getBalance() {
        const price = new Price();
        const currencies = this.dataService.empireProfile?.Data.currencies;
        if (currencies === undefined) {
            return price;
        }
        for (const [currency, amount] of pairs(currencies)) {
            price.setCost(currency, new InfiniteMath(amount));
        }
        return price;
    }

    isSufficientBalance(price: Price): [boolean, Price] {
        const balance = this.getBalance();
        let sufficient = true;
        for (const [currency, cost] of price.costPerCurrency) {
            const balCost = balance.getCost(currency);
            if (balCost === undefined) {
                if (!cost.le(0)) {
                    sufficient = false;
                }
            }
            else {
                if (balCost.lt(cost)) {
                    sufficient = false;
                }
                balance.setCost(currency, balCost.sub(cost));
            }
        }
        return [sufficient, balance];
    }

    setBalance(balance: Price) {
        for (const [currency, cost] of balance.costPerCurrency) {
            this.setCost(currency, cost, true);
        }
        if (this.dataService.empireProfile !== undefined) {
            const balance = this.dataService.empireProfile.Data.currencies;
            CurrencyCanister.balance.set(balance);
            this.balanceChanged.fire(balance);
        }
    }

    purchase(price: Price) {
        const [isSufficient, bal] = this.isSufficientBalance(price);
        if (isSufficient === true) {
            this.setBalance(bal);
            return true;
        }
        return false;
    }

    onStart() {
        this.dataService.empireProfileLoaded.once((profile) => CurrencyCanister.balance.set(profile.Data.currencies));
        if (this.dataService.empireProfile !== undefined) {
            CurrencyCanister.balance.set(this.dataService.empireProfile.Data.currencies);
        }
        task.spawn(() => {
            while (task.wait(1)) {
                const profile = this.dataService.empireProfile;
                if (profile === undefined) {
                    continue;
                }
                const currencies = profile.Data.currencies;
                const mostCurrencies = profile.Data.mostCurrencies;
                for (const [currency, amount] of currencies) {
                    const mostRecorded = mostCurrencies.get(currency);
                    if (mostRecorded === undefined || new InfiniteMath(mostRecorded).lt(new InfiniteMath(amount))) {
                        mostCurrencies.set(currency, amount);
                    }
                }
                CurrencyCanister.mostBalance.set(mostCurrencies);
            }
        });
    }
}