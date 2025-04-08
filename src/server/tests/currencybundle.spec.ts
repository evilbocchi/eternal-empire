/// <reference types="@rbxts/testez/globals" />
import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = function () {


    describe("constructor", () => {

        it("creates a number", () => {
            const value = new OnoeNum(1e12);
            expect(new CurrencyBundle().set("Funds", value).get("Funds")).to.equal(value);
        });

        it("handles large numbers", () => {
            const value = new OnoeNum(1e120);
            expect(new CurrencyBundle().set("Funds", value).get("Funds")).to.equal(value);
        });
    });
};