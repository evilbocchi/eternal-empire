/// <reference types="@rbxts/testez/globals" />
import { OnoeNum } from "@rbxts/serikanum";
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

    describe("arithmetic", () => {
        it("adds bundles without mutating the original by default", () => {
            const base = new CurrencyBundle().set("Funds", 10).set("Power", 5);
            const other = new CurrencyBundle().set("Funds", 5).set("Power", 2);

            const result = base.add(other);

            expect(result.get("Funds")?.equals(new OnoeNum(15))).to.equal(true);
            expect(result.get("Power")?.equals(new OnoeNum(7))).to.equal(true);
            expect(base.get("Funds")?.equals(new OnoeNum(10))).to.equal(true);
            expect(base.get("Power")?.equals(new OnoeNum(5))).to.equal(true);
        });

        it("adds bundles in place when requested", () => {
            const base = new CurrencyBundle().set("Funds", 10);
            const other = new CurrencyBundle().set("Funds", 4);

            base.add(other, true);

            expect(base.get("Funds")?.equals(new OnoeNum(14))).to.equal(true);
        });

        it("supports subtraction and multiplication", () => {
            const base = new CurrencyBundle().set("Funds", 12).set("Power", 8);
            const other = new CurrencyBundle().set("Funds", 2).set("Power", 3);

            const subtracted = base.sub(other);
            expect(subtracted.get("Funds")?.equals(new OnoeNum(10))).to.equal(true);
            expect(subtracted.get("Power")?.equals(new OnoeNum(5))).to.equal(true);

            const multiplied = base.mul(2);
            expect(multiplied.get("Funds")?.equals(new OnoeNum(24))).to.equal(true);
            expect(multiplied.get("Power")?.equals(new OnoeNum(16))).to.equal(true);
        });

        it("divides by another bundle", () => {
            const base = new CurrencyBundle().set("Funds", 100).set("Power", 50);
            const divisor = new CurrencyBundle().set("Funds", 4).set("Power", 5);

            const divided = base.div(divisor);
            expect(divided.get("Funds")?.equals(new OnoeNum(25))).to.equal(true);
            expect(divided.get("Power")?.equals(new OnoeNum(10))).to.equal(true);
        });

        it("raises currencies to a power", () => {
            const base = new CurrencyBundle().set("Funds", 2).set("Power", 3);
            const powered = base.pow(3);

            expect(powered.get("Funds")?.equals(new OnoeNum(8))).to.equal(true);
            expect(powered.get("Power")?.equals(new OnoeNum(27))).to.equal(true);
        });
    });

    describe("affordability", () => {
        it("evaluates affordability and returns remaining balance", () => {
            const wallet = new CurrencyBundle().set("Funds", 100).set("Power", 5);
            const cost = new CurrencyBundle().set("Funds", 60).set("Power", 1);

            const remainingMap = new Map<Currency, OnoeNum>();
            const sufficient = wallet.canAfford(cost.amountPerCurrency, remainingMap);

            expect(sufficient).to.equal(true);

            const remaining = new CurrencyBundle(remainingMap, true);
            expect(remaining.get("Funds")?.equals(40)).to.equal(true);
            expect(remaining.get("Power")?.equals(4)).to.equal(true);
        });

        it("correctly identifies insufficient balance", () => {
            const wallet = new CurrencyBundle().set("Funds", 25);
            const cost = new CurrencyBundle().set("Funds", 30);

            const sufficient = wallet.canAfford(cost.amountPerCurrency, new Map());
            expect(sufficient).to.equal(false);
        });
    });

    describe("utilities", () => {
        it("clones deeply and compares equality", () => {
            const bundle = new CurrencyBundle().set("Funds", 42).set("Power", 9);
            const clone = bundle.clone();

            expect(bundle.equals(clone)).to.equal(true);
            bundle.set("Funds", 50);
            expect(bundle.equals(clone)).to.equal(false);
        });

        it("has all currencies when initialized with ones", () => {
            const ones = CurrencyBundle.ones();
            expect(ones.hasAll()).to.equal(true);
        });

        it("formats currency strings in sorted order", () => {
            const bundle = new CurrencyBundle().set("Funds", 1500).set("Power", 2);
            const formatted = bundle.toString();

            expect(formatted.find("Funds")).to.be.ok();
            expect(formatted.find("Power")).to.be.ok();
        });

        it("removes currencies when set with undefined", () => {
            const bundle = new CurrencyBundle().set("Funds", 10).set("Power", 5);

            bundle.set("Power", undefined);

            expect(bundle.get("Funds")?.equals(new OnoeNum(10))).to.equal(true);
            expect(bundle.get("Power")).to.equal(undefined);
        });
    });
};
