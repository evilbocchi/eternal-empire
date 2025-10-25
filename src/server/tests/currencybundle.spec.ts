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

        expect(result.get("Funds")?.equals(new OnoeNum(15))).toBe(true);
        expect(result.get("Power")?.equals(new OnoeNum(7))).toBe(true);
        expect(base.get("Funds")?.equals(new OnoeNum(10))).toBe(true);
        expect(base.get("Power")?.equals(new OnoeNum(5))).toBe(true);
    });

    it("adds bundles in place when requested", () => {
        const base = new CurrencyBundle().set("Funds", 10);
        const other = new CurrencyBundle().set("Funds", 4);

        base.add(other, true);

        expect(base.get("Funds")?.equals(new OnoeNum(14))).toBe(true);
    });

    it("supports subtraction and multiplication", () => {
        const base = new CurrencyBundle().set("Funds", 12).set("Power", 8);
        const other = new CurrencyBundle().set("Funds", 2).set("Power", 3);

        const subtracted = base.sub(other);
        expect(subtracted.get("Funds")?.equals(new OnoeNum(10))).toBe(true);
        expect(subtracted.get("Power")?.equals(new OnoeNum(5))).toBe(true);

        const multiplied = base.mulConstant(2);
        expect(multiplied.get("Funds")?.equals(new OnoeNum(24))).toBe(true);
        expect(multiplied.get("Power")?.equals(new OnoeNum(16))).toBe(true);
    });

    it("divides by another bundle", () => {
        const base = new CurrencyBundle().set("Funds", 100).set("Power", 50);
        const divisor = new CurrencyBundle().set("Funds", 4).set("Power", 5);

        const divided = base.div(divisor);
        expect(divided.get("Funds")?.equals(new OnoeNum(25))).toBe(true);
        expect(divided.get("Power")?.equals(new OnoeNum(10))).toBe(true);
    });

    it("raises currencies to a power", () => {
        const base = new CurrencyBundle().set("Funds", 2).set("Power", 3);
        const powered = base.powConstant(3);

        expect(powered.get("Funds")?.equals(new OnoeNum(8))).toBe(true);
        expect(powered.get("Power")?.equals(new OnoeNum(27))).toBe(true);
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
        expect(remaining.get("Funds")?.equals(40)).toBe(true);
        expect(remaining.get("Power")?.equals(4)).toBe(true);
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
