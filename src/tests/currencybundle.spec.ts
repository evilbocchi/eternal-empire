import { describe, expect, it } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";

describe("constructor", () => {
    it("creates a number", () => {
        const value = new OnoeNum(1e12);
        expect(new CurrencyBundle().set("Funds", value).get("Funds")).toBe(value);
    });

    it("handles large numbers", () => {
        const value = new OnoeNum(1e120);
        expect(new CurrencyBundle().set("Funds", value).get("Funds")).toBe(value);
    });
});

describe("arithmetic", () => {
    it("adds bundles without mutating the original by default", () => {
        const base = new CurrencyBundle().set("Funds", 10).set("Power", 5);
        const other = new CurrencyBundle().set("Funds", 5).set("Power", 2);

        const result = base.add(other);

        expect(result.get("Funds"))?.toEqualOnoeNum(new OnoeNum(15));
        expect(result.get("Power"))?.toEqualOnoeNum(new OnoeNum(7));
        expect(base.get("Funds"))?.toEqualOnoeNum(new OnoeNum(10));
        expect(base.get("Power"))?.toEqualOnoeNum(new OnoeNum(5));
    });

    it("adds bundles in place when requested", () => {
        const base = new CurrencyBundle().set("Funds", 10);
        const other = new CurrencyBundle().set("Funds", 4);

        base.add(other, true);

        expect(base.get("Funds"))?.toEqualOnoeNum(new OnoeNum(14));
    });

    it("supports subtraction and multiplication", () => {
        const base = new CurrencyBundle().set("Funds", 12).set("Power", 8);
        const other = new CurrencyBundle().set("Funds", 2).set("Power", 3);

        const subtracted = base.sub(other);
        expect(subtracted.get("Funds"))?.toEqualOnoeNum(new OnoeNum(10));
        expect(subtracted.get("Power"))?.toEqualOnoeNum(new OnoeNum(5));

        const multiplied = base.mulConstant(2);
        expect(multiplied.get("Funds"))?.toEqualOnoeNum(new OnoeNum(24));
        expect(multiplied.get("Power"))?.toEqualOnoeNum(new OnoeNum(16));
    });

    it("divides by another bundle", () => {
        const base = new CurrencyBundle().set("Funds", 100).set("Power", 50);
        const divisor = new CurrencyBundle().set("Funds", 4).set("Power", 5);

        const divided = base.div(divisor);
        expect(divided.get("Funds"))?.toEqualOnoeNum(new OnoeNum(25));
        expect(divided.get("Power"))?.toEqualOnoeNum(new OnoeNum(10));
    });

    it("raises currencies to a power", () => {
        const base = new CurrencyBundle().set("Funds", 2).set("Power", 3);
        const powered = base.powConstant(3);

        expect(powered.get("Funds"))?.toEqualOnoeNum(new OnoeNum(8));
        expect(powered.get("Power"))?.toEqualOnoeNum(new OnoeNum(27));
    });
});

describe("affordability", () => {
    it("evaluates affordability and returns remaining balance", () => {
        const wallet = new CurrencyBundle().set("Funds", 100).set("Power", 5);
        const cost = new CurrencyBundle().set("Funds", 60).set("Power", 1);

        const remainingMap = new Map<Currency, OnoeNum>();
        const sufficient = wallet.canAfford(cost.amountPerCurrency, remainingMap);

        expect(sufficient).toBe(true);

        const remaining = new CurrencyBundle(remainingMap, true);
        expect(remaining.get("Funds"))?.toEqualOnoeNum(new OnoeNum(40));
        expect(remaining.get("Power"))?.toEqualOnoeNum(new OnoeNum(4));
    });

    it("correctly identifies insufficient balance", () => {
        const wallet = new CurrencyBundle().set("Funds", 25);
        const cost = new CurrencyBundle().set("Funds", 30);

        const sufficient = wallet.canAfford(cost.amountPerCurrency, new Map());
        expect(sufficient).toBe(false);
    });
});

describe("utilities", () => {
    it("clones deeply and compares equality", () => {
        const bundle = new CurrencyBundle().set("Funds", 42).set("Power", 9);
        const clone = bundle.clone();

        expect(bundle.equals(clone)).toBe(true);
        bundle.set("Funds", 50);
        expect(bundle.equals(clone)).toBe(false);
    });

    it("has all currencies when initialized with ones", () => {
        const ones = CurrencyBundle.ones();
        expect(ones.hasAll()).toBe(true);
    });

    it("formats currency strings in sorted order", () => {
        const bundle = new CurrencyBundle().set("Funds", 1500).set("Power", 2);
        const formatted = bundle.toString();

        expect(formatted.find("Funds")).toBeDefined();
        expect(formatted.find("Power")).toBeDefined();
    });

    it("removes currencies when set with undefined", () => {
        const bundle = new CurrencyBundle().set("Funds", 10).set("Power", 5);

        bundle.set("Power", undefined);

        expect(bundle.get("Funds")?.equals(new OnoeNum(10))).toBe(true);
        expect(bundle.get("Power")).toBe(undefined);
    });
});
