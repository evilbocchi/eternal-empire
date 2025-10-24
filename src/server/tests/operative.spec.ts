/// <reference types="@rbxts/testez/globals" />
import { OnoeNum } from "@rbxts/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Operative, { IOperative } from "shared/item/traits/Operative";

export = function () {
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

            expect(totalAdd.get("Funds")?.equals(5)).to.equal(true);
            expect(totalMul.get("Funds")?.equals(15)).to.equal(true);
            expect(totalPow.get("Funds")?.equals(2)).to.equal(true);

            expect(baseAdd.get("Funds")?.equals(1)).to.equal(true);
            expect(baseMul.get("Funds")?.equals(3)).to.equal(true);
            expect(basePow.get("Funds")?.equals(1)).to.equal(true);
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

            expect(totalAdd?.get("Funds")?.equals(6)).to.equal(true);
            expect(totalMul?.get("Funds")?.equals(2)).to.equal(true);
            expect(totalPow?.get("Funds")?.equals(1)).to.equal(true);

            expect(add.get("Funds")?.equals(2)).to.equal(true);
            expect(mul.get("Funds")?.equals(3)).to.equal(true);
            expect(pow.get("Funds")?.equals(4)).to.equal(true);
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

            expect(funds).to.be.ok();
            expect(funds?.equals(new OnoeNum(27000))).to.equal(true);
            expect(value.get("Funds")?.equals(10)).to.equal(true);
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

            expect(totalAdd.get("Funds")?.equals(3)).to.equal(true);
            expect(totalMul.get("Funds")?.equals(2)).to.equal(true);
            expect(totalPow.get("Funds")?.equals(3)).to.equal(true);

            expect(baseAdd.get("Funds")?.equals(1)).to.equal(true);
            expect(baseMul.get("Funds")?.equals(1)).to.equal(true);
            expect(basePow.get("Funds")?.equals(1)).to.equal(true);
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

            expect(funds).to.be.ok();
            expect(funds?.equals(64)).to.equal(true);
            expect(base.get("Funds")?.equals(5)).to.equal(true);
        });
    });

    describe("lessThan", () => {
        it("prioritizes power comparisons before multiplication and addition", () => {
            const operative = createOperative().setPow(new CurrencyBundle().set("Funds", 2));
            const other: IOperative = { pow: new CurrencyBundle().set("Funds", 3) };

            expect(operative.lessThan(other, "Funds")).to.equal(true);
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

            expect(operative.lessThan(other, "Funds")).to.equal(true);
        });

        it("returns false when no terms are strictly smaller", () => {
            const operative = createOperative().setAdd(new CurrencyBundle().set("Funds", 5));
            const other: IOperative = { add: new CurrencyBundle().set("Funds", 3) };

            expect(operative.lessThan(other, "Funds")).to.equal(false);
        });
    });

    describe("getCurrencies", () => {
        it("collects currencies across all configured terms", () => {
            const operative = createOperative()
                .setAdd(new CurrencyBundle().set("Funds", 1))
                .setMul(new CurrencyBundle().set("Power", 2))
                .setPow(new CurrencyBundle().set("Skill", 3));

            const currencies = operative.getCurrencies();

            expect(currencies.has("Funds")).to.equal(true);
            expect(currencies.has("Power")).to.equal(true);
            expect(currencies.has("Skill")).to.equal(true);

            let count = 0;
            currencies.forEach(() => (count += 1));
            expect(count).to.equal(3);
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

            expect(addStart).to.equal(undefined);
            expect(mulStart).to.equal(undefined);
            expect(powStart).to.equal(undefined);
            expect(formatted).never.to.equal(template);
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

            expect(funds).to.be.ok();
            expect(funds?.equals(900)).to.equal(true);
            expect(value.get("Funds")?.equals(10)).to.equal(true);
        });

        it("clamps negative results to zero", () => {
            const value = new CurrencyBundle().set("Funds", 2);
            const totalAdd = new CurrencyBundle().set("Funds", -5);

            const result = Operative.coalesce(value, totalAdd);
            const funds = result.get("Funds");

            expect(funds).to.be.ok();
            expect(funds?.equals(0)).to.equal(true);
        });
    });
};
