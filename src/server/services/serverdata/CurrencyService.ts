import { OnStart, Service } from "@flamework/core";
import Price from "shared/Price";
import { Currency } from "shared/constants";
import { Fletchette, RemoteProperty } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { DataService } from "./DataService";

declare global {
    interface FletchetteCanisters {
        CurrencyCanister: typeof CurrencyCanister;
    }
}

const CurrencyCanister = Fletchette.createCanister("CurrencyCanister", {
    balance: new RemoteProperty<Map<Currency, InfiniteMath>>(new Map(), false),
});

@Service()
export class CurrencyService implements OnStart {

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
                profile.Data.currencies.set(currency, cost);
            }
            if (dontPropagateToClient !== true) {
                CurrencyCanister.balance.set(profile.Data.currencies);
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
        if (this.dataService.empireProfile !== undefined)
            CurrencyCanister.balance.set(this.dataService.empireProfile.Data.currencies);
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
        this.dataService.empireProfileLoaded.Connect((profile) => {
            CurrencyCanister.balance.set(profile.Data.currencies);
        });
        if (this.dataService.empireProfile !== undefined) {
            CurrencyCanister.balance.set(this.dataService.empireProfile.Data.currencies);
        }
    }
}