import { describe, expect, it } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Operative, { IOperative } from "shared/item/traits/Operative";

let nextId = 0;
const createItem = () => new Item(`OperativeSpec_${nextId++}`);
const createOperative = () => new Operative(createItem());

describe("applyOperative", () => {
    it("combines additive, multiplicative, and power terms without mutating inputs", () => {
        const operative = createOperative()
            .setAdd(new CurrencyBundle().set("Funds", 4))
            .setMul(new CurrencyBundle().set("Funds", 5))
            .setPow(new CurrencyBundle().set("Funds", 2));

        const baseAdd = new CurrencyBundle().set("Funds", 1);
        const baseMul = new CurrencyBundle().set("Funds", 3);
        const basePow = new CurrencyBundle().set("Funds", 1);

        const [totalAdd, totalMul, totalPow] = Operative.applyOperative(baseAdd, baseMul, basePow, operative);

        expect(totalAdd.get("Funds")?.equals(5)).toBe(true);
        expect(totalMul.get("Funds")?.equals(15)).toBe(true);
        expect(totalPow.get("Funds")?.equals(2)).toBe(true);

        expect(baseAdd.get("Funds")?.equals(1)).toBe(true);
        expect(baseMul.get("Funds")?.equals(3)).toBe(true);
        expect(basePow.get("Funds")?.equals(1)).toBe(true);
    });
});

describe("applySpreadOperative", () => {
    it("supports repeats and inverse operations", () => {
        const baseAdd = new CurrencyBundle().set("Funds", 10);
        const baseMul = new CurrencyBundle().set("Funds", 18);
        const basePow = new CurrencyBundle().set("Funds", 16);

        const add = new CurrencyBundle().set("Funds", 2);
        const mul = new CurrencyBundle().set("Funds", 3);
        const pow = new CurrencyBundle().set("Funds", 4);

        const [totalAdd, totalMul, totalPow] = Operative.applySpreadOperative(
            baseAdd.clone(),
            baseMul.clone(),
            basePow.clone(),
            add,
            mul,
            pow,
            true,
            2,
        );

        expect(totalAdd?.get("Funds")?.equals(6)).toBe(true);
        expect(totalMul?.get("Funds")?.equals(2)).toBe(true);
        expect(totalPow?.get("Funds")?.equals(1)).toBe(true);

        expect(add.get("Funds")?.equals(2)).toBe(true);
        expect(mul.get("Funds")?.equals(3)).toBe(true);
        expect(pow.get("Funds")?.equals(4)).toBe(true);
    });
});

describe("apply", () => {
    it("applies all terms to a value bundle", () => {
        const operative = createOperative()
            .setAdd(new CurrencyBundle().set("Funds", 5))
            .setMul(new CurrencyBundle().set("Funds", 2))
            .setPow(new CurrencyBundle().set("Funds", 3));

        const value = new CurrencyBundle().set("Funds", 10);
        const result = operative.apply(value);
        const funds = result.get("Funds");

        expect(funds).toBeDefined();
        expect(funds?.equals(new OnoeNum(27000))).toBe(true);
        expect(value.get("Funds")?.equals(10)).toBe(true);
    });

    it("returns spread tuples when called with explicit bundles", () => {
        const operative = createOperative()
            .setAdd(new CurrencyBundle().set("Funds", 2))
            .setMul(new CurrencyBundle().set("Funds", 2))
            .setPow(new CurrencyBundle().set("Funds", 3));

        const baseAdd = new CurrencyBundle().set("Funds", 1);
        const baseMul = new CurrencyBundle().set("Funds", 1);
        const basePow = new CurrencyBundle().set("Funds", 1);

        const [totalAdd, totalMul, totalPow] = operative.apply(baseAdd, baseMul, basePow) as LuaTuple<
            [CurrencyBundle, CurrencyBundle, CurrencyBundle]
        >;

        expect(totalAdd.get("Funds")?.equals(3)).toBe(true);
        expect(totalMul.get("Funds")?.equals(2)).toBe(true);
        expect(totalPow.get("Funds")?.equals(3)).toBe(true);

        expect(baseAdd.get("Funds")?.equals(1)).toBe(true);
        expect(baseMul.get("Funds")?.equals(1)).toBe(true);
        expect(basePow.get("Funds")?.equals(1)).toBe(true);
    });

    it("supports repeating scalar application without spread bundles", () => {
        const operative = createOperative()
            .setAdd(new CurrencyBundle().set("Funds", 1))
            .setMul(new CurrencyBundle().set("Funds", 2));

        const baseAdd = new CurrencyBundle();
        const baseMul = new CurrencyBundle().set("Funds", 1);
        const basePow = new CurrencyBundle().set("Funds", 1);

        const [totalAdd, totalMul, totalPow] = Operative.applyOperative(
            baseAdd.clone(),
            baseMul.clone(),
            basePow.clone(),
            operative,
            false,
            3,
        );

        const base = new CurrencyBundle().set("Funds", 5);
        const result = Operative.coalesce(base, totalAdd, totalMul, totalPow);
        const funds = result.get("Funds");

        expect(funds).toBeDefined();
        expect(funds?.equals(64)).toBe(true);
        expect(base.get("Funds")?.equals(5)).toBe(true);
    });
});

describe("lessThan", () => {
    it("prioritizes power comparisons before multiplication and addition", () => {
        const operative = createOperative().setPow(new CurrencyBundle().set("Funds", 2));
        const other: IOperative = { pow: new CurrencyBundle().set("Funds", 3) };

        expect(operative.lessThan(other, "Funds")).toBe(true);
    });

    it("falls back to multiplication then addition when powers are equal", () => {
        const operative = createOperative()
            .setMul(new CurrencyBundle().set("Funds", 2))
            .setPow(new CurrencyBundle().set("Funds", 3));

        const other: IOperative = {
            pow: new CurrencyBundle().set("Funds", 3),
            mul: new CurrencyBundle().set("Funds", 3),
            add: new CurrencyBundle().set("Funds", 10),
        };

        expect(operative.lessThan(other, "Funds")).toBe(true);
    });

    it("returns false when no terms are strictly smaller", () => {
        const operative = createOperative().setAdd(new CurrencyBundle().set("Funds", 5));
        const other: IOperative = { add: new CurrencyBundle().set("Funds", 3) };

        expect(operative.lessThan(other, "Funds")).toBe(false);
    });
});

describe("getCurrencies", () => {
    it("collects currencies across all configured terms", () => {
        const operative = createOperative()
            .setAdd(new CurrencyBundle().set("Funds", 1))
            .setMul(new CurrencyBundle().set("Power", 2))
            .setPow(new CurrencyBundle().set("Skill", 3));

        const currencies = operative.getCurrencies();

        expect(currencies.has("Funds")).toBe(true);
        expect(currencies.has("Power")).toBe(true);
        expect(currencies.has("Skill")).toBe(true);

        let count = 0;
        currencies.forEach(() => (count += 1));
        expect(count).toBe(3);
    });
});

describe("format", () => {
    it("replaces formatting tokens when terms exist", () => {
        const operative = createOperative()
            .setAdd(new CurrencyBundle().set("Funds", 1))
            .setMul(new CurrencyBundle().set("Power", 2))
            .setPow(new CurrencyBundle().set("Skill", 3));

        const template = "Add %%add%% | Mul %%mul%% | Pow %%pow%%";
        const formatted = operative.format(template);

        const [addStart] = formatted.find("%%add%%");
        const [mulStart] = formatted.find("%%mul%%");
        const [powStart] = formatted.find("%%pow%%");

        expect(addStart).toBe(undefined);
        expect(mulStart).toBe(undefined);
        expect(powStart).toBe(undefined);
        expect(formatted).never.toBe(template);
    });
});

describe("coalesce", () => {
    it("applies addition, multiplication, and power in order", () => {
        const value = new CurrencyBundle().set("Funds", 10);
        const totalAdd = new CurrencyBundle().set("Funds", 5);
        const totalMul = new CurrencyBundle().set("Funds", 2);
        const totalPow = new CurrencyBundle().set("Funds", 2);

        const result = Operative.coalesce(value, totalAdd, totalMul, totalPow);
        const funds = result.get("Funds");

        expect(funds).toBeDefined();
        expect(funds?.equals(900)).toBe(true);
        expect(value.get("Funds")?.equals(10)).toBe(true);
    });

    it("clamps negative results to zero", () => {
        const value = new CurrencyBundle().set("Funds", 2);
        const totalAdd = new CurrencyBundle().set("Funds", -5);

        const result = Operative.coalesce(value, totalAdd);
        const funds = result.get("Funds");

        expect(funds).toBeDefined();
        expect(funds?.equals(0)).toBe(true);
    });
});
