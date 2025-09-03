import { OnoeNum } from "@antivivi/serikanum";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";

export = new Command(script.Name)
    .addAlias("ecoset")
    .setDescription(
        "<currency> <first> <second> : Set balance for a currency. You can type _ as a replacement for spaces.",
    )
    .setExecute((_o, currency, first, second) => {
        const amount =
            second === undefined
                ? new OnoeNum(tonumber(first) ?? 0)
                : OnoeNum.fromSerika(tonumber(first) ?? 0, tonumber(second) ?? 0);

        if (currency === "all") {
            for (const [c, _] of pairs(CURRENCY_DETAILS)) {
                CommandAPI.Currency.set(c as Currency, amount);
                CommandAPI.Data.empireData.mostCurrencies.set(c as Currency, amount);
            }
            return;
        }

        currency = currency.gsub("_", " ")[0];
        if (CURRENCY_DETAILS[currency as Currency] === undefined) return;
        CommandAPI.Currency.set(currency as Currency, amount);
        CommandAPI.Data.empireData.mostCurrencies.set(currency as Currency, amount);
    })
    .setPermissionLevel(4);
