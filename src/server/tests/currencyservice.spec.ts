/// <reference types="@rbxts/testez/globals" />
import { OnoeNum } from "@rbxts/serikanum";
import { Janitor } from "@rbxts/janitor";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { Server } from "shared/api/APIExpose";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";

export = function () {
    beforeAll(() => {
        eater.janitor = new Janitor();
        mockFlamework();
    });

    afterAll(() => {
        eater.janitor?.Destroy();
    });

    describe("CurrencyService", () => {
        beforeEach(() => {
            Server.Currency.set("Funds", new OnoeNum(0));
            Server.Currency.set("Power", new OnoeNum(0));
        });

        it("sets and retrieves currency balances", () => {
            const amount = new OnoeNum(250);
            Server.Currency.set("Funds", amount);

            expect(Server.Currency.get("Funds").equals(amount)).to.equal(true);
        });

        it("increments currencies cumulatively", () => {
            Server.Currency.set("Funds", new OnoeNum(10));
            Server.Currency.increment("Funds", new OnoeNum(5));

            expect(Server.Currency.get("Funds").equals(new OnoeNum(15))).to.equal(true);
        });

        it("performs purchases when balance suffices", () => {
            Server.Currency.set("Funds", new OnoeNum(100));
            const price = new CurrencyBundle().set("Funds", 40);

            const success = Server.Currency.purchase(price);

            expect(success).to.equal(true);
            expect(Server.Currency.get("Funds").equals(new OnoeNum(60))).to.equal(true);
        });

        it("rejects purchases that exceed balance", () => {
            Server.Currency.set("Funds", new OnoeNum(20));
            const price = new CurrencyBundle().set("Funds", 50);

            const success = Server.Currency.purchase(price);

            expect(success).to.equal(false);
            expect(Server.Currency.get("Funds").equals(new OnoeNum(20))).to.equal(true);
        });

        it("emits balanceChanged when propagating updates", () => {
            let observed = false;
            const connection = Server.Currency.balanceChanged.connect((bundle) => {
                observed = bundle.get("Funds")?.equals(new OnoeNum(75)) ?? false;
            });

            Server.Currency.set("Funds", new OnoeNum(75));
            Server.Currency.propagate();
            connection.Disconnect();

            expect(observed).to.equal(true);
        });

        it("computes offline revenue from recent gains", () => {
            Server.Data.empireData.playtime = 200;
            Server.Data.empireData.lastResetPlaytime = 100;
            Server.Data.empireData.mostCurrenciesSinceReset.set("Funds", new OnoeNum(500));

            const revenue = Server.Currency.getOfflineRevenue();
            // CurrencyService uses a minimum diff of 600 seconds, so revenue = 500 / 600
            expect(revenue.get("Funds")?.equals(new OnoeNum(500).div(new OnoeNum(600)))).to.equal(true);
        });
    });
};
