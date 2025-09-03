/// <reference types="@rbxts/testez/globals" />
import { OnoeNum } from "@antivivi/serikanum";

export = function () {
    /**
     * Change this to test a different number library.
     */
    const Number = OnoeNum;

    /**
     * Macro for creating a number from the number library being tested.
     *
     * @param n The number to create.
     * @param exponent Multiplies the number by `10^exponent`. Default is 0.
     * @returns The number object.
     */
    const num = (n: number, exponent?: number) => {
        if (exponent === undefined) return new Number(n);

        return new Number(n).mul(new Number(10).pow(exponent));
    };
    type Number = ReturnType<typeof num>;

    /**
     * Macro for equality check on the tested number library.
     *
     * @param a The number formatted by the library.
     * @param b The number to compare against.
     * @param result The expected result. Default is true.
     * @param epsilon The allowed error. Default is 1e-5.
     */
    const expectNumEquals = (a: Number | undefined, b: unknown, result = true, epsilon = 1e-5) => {
        const actual = new OnoeNum(b as number);

        if (a === undefined) {
            return expect(false).to.be.equal(true); // fail the test
        }

        const subClose = math.abs(a.sub(actual).revert()) < epsilon;
        const divved = a.div(actual).revert();
        const divClose = divved > 0 && math.abs(divved - 1) < epsilon;
        const testResult = subClose || divClose;

        if (testResult !== result) {
            warn(`Expected ${a.revert()} to ${result ? "" : "not "}equal ${actual.revert()}.`);
        }

        expect(testResult).to.be.equal(result);
    };

    describe("constructor", () => {
        const check = (n: number) => {
            const created = num(n);
            expectNumEquals(created, n); // basic check
            expectNumEquals(created, created); // symmetry check
            expect(created.equals(created)).to.equal(true); // reflexivity check

            if (math.abs(n) > 1e-5) {
                expectNumEquals(created, 0, false); // zero check
                expectNumEquals(created.unary(), created, false); // negation check
            }
        };

        it("creates a number", () => {
            check(5);
            check(5.5);
            check(0);
            check(-195);
            check(-1259.621);
        });

        it("handles large numbers", () => {
            check(2.62e30);
            check(1.16e-30);
            check(3e303);
        });
    });

    describe("addition and subtraction", () => {
        const check = (a: unknown, b: unknown, addActual?: unknown, subActual?: unknown) => {
            const num1 = new Number(a as number);
            const num2 = new Number(b as number);

            addActual ??= num1.revert() + num2.revert();
            subActual ??= num1.revert() - num2.revert();

            const added = num1.add(num2);
            expectNumEquals(added, addActual); // basic addition
            expectNumEquals(num1.sub(num2), subActual); // basic subtraction

            const comAdded = num2.add(num1);
            expectNumEquals(comAdded, added); // commutative property
            expectNumEquals(num1.unary().add(num2.unary()), added.unary()); // negation property
            expectNumEquals(num2.unary().add(num1.unary()), comAdded.unary()); // commutative property
            expectNumEquals(num1.add(0), num1); // identity property
            expectNumEquals(num1.sub(0), num1); // identity property
            expectNumEquals(num1.add(num1.unary()), 0); // negation property
            expectNumEquals(num1.sub(num1), 0); // identity property
        };

        it("handles basic numbers", () => {
            const a = 32336536;
            const b = 439923618;
            check(a, b);
            check(a, b * 10);
            check(a * 10, b);
        });

        it("handles large numbers", () => {
            check(1000000, 500000);
            check(1e30, 1e30);
            check(1e-30, 1e-30);
            check(3e303, 2e303);
            check(num(1, 500), num(2.6, 500), num(3.6, 500), num(-1.6, 500));
            check(num(6.9, 1e121), num(1, 1e121), num(7.9, 1e121), num(5.9, 1e121));
            check(num(5, 1000), num(6, 1001), num(6.5, 1001), num(-5.5, 1001));
        });

        it("handles decimal numbers", () => {
            check(5.5, 2.5);
            check(5.5, 2);
            check(625.612, 925.108);
        });
    });

    describe("multiplication and division", () => {
        const check = (a: unknown, b: unknown, mulActual?: unknown, divActual?: unknown) => {
            const num1 = new Number(a as number);
            const num2 = new Number(b as number);

            mulActual ??= num1.revert() * num2.revert();
            divActual ??= num1.revert() / num2.revert();

            expectNumEquals(num1.mul(num2), mulActual); // basic multiplication
            expectNumEquals(num1.div(num2), divActual); // basic division

            expectNumEquals(num1.mul(1), num1); // identity property
            expectNumEquals(num1.div(1), num1); // identity property

            expectNumEquals(num1.mul(0), 0); // zero property
            expectNumEquals(num1.mul(-1), num1.unary()); // negation property
            expectNumEquals(num1.div(-1), num1.unary()); // negation property

            expectNumEquals(num1.mul(0.5), num1.div(2)); // inverse property
            expectNumEquals(num1.mul(num2.div(num1)), num2); // inverse property
            expectNumEquals(num2.mul(num1.div(num1)), num2); // inverse property

            expectNumEquals(num1.add(num1), num1.mul(2)); // distributive property
            expectNumEquals(num1.add(num2).mul(2), num1.mul(2).add(num2.mul(2))); // distributive property
        };

        it("handles basic numbers", () => {
            const a = 923571;
            const b = 209;
            check(a, b);
            check(a, b * 10);
            check(a * 10, b);
        });

        it("handles large numbers", () => {
            check(1000000, 500000);
            check(1e30, 1000, 1e33, 1e27);
            check(num(1, 500), 200, num(200, 500), num(5, 497));
            check(num(3, 1e121), 3, num(9, 1e121), num(1, 1e121));
        });

        it("handles decimal numbers", () => {
            check(5.5, 2.5);
            check(5.5, 2);
            check(625.612, 925.108);
        });
    });

    describe("exponentiation", () => {
        const check = (a: unknown, base: number, powActual?: unknown) => {
            const num = new Number(a as number);

            powActual ??= math.pow(num.revert(), base);
            expectNumEquals(num.pow(base), powActual); // basic exponentiation
            expectNumEquals(num.pow(1), num); // identity property
            expectNumEquals(num.pow(0), 1); // zero property
            expectNumEquals(num.pow(-1), new Number(1).div(num)); // inverse property
            expectNumEquals(num.pow(2).pow(0.5), num); // chain
            expectNumEquals(num.pow(2).pow(3), num.pow(6)); // chain
        };

        it("handles basic numbers", () => {
            const a = 6200;
            check(a, 2);
        });

        it("handles large numbers", () => {
            check(1000000, 2);
            check(1e30, 3);
            check(num(1, 500), 2, num(1, 1000));
            check(num(2, 1e20), 3, num(8, 3e20));
        });

        it("handles decimal numbers", () => {
            check(5.5, 2);
            check(5.5, 0);
            check(625.612, 0.5);
        });
    });

    describe("comparison", () => {
        const check = (a: unknown, b: unknown, sign = 0) => {
            const num1 = new Number(a as number);
            const num2 = new Number(b as number);

            expect(num1.equals(num2)).to.equal(sign === 0);
            expect(num1.lessThan(num2)).to.equal(sign < 0);
            expect(num1.moreThan(num2)).to.equal(sign > 0);
            expect(num1.lessEquals(num2)).to.equal(sign <= 0);
            expect(num1.moreEquals(num2)).to.equal(sign >= 0);
        };

        it("handles basic numbers", () => {
            check(5, 5);
            check(5, 6, -1);
            check(5, 4, 1);
        });

        it("handles large numbers", () => {
            check(1e30, 1e30);
            check(1e30, 1e31, -1);
            check(1e30, 1e29, 1);
        });

        it("handles decimal numbers", () => {
            check(5.5, 5.5);
            check(5.5, 5.6, -1);
            check(5.5, 5.4, 1);
        });
    });

    describe("rounding", () => {
        const check = (n: unknown, roundActual?: unknown, floorActual?: unknown, ceilActual?: unknown) => {
            const num = new Number(n as number);

            roundActual ??= math.round(num.revert());
            floorActual ??= math.floor(num.revert());
            ceilActual ??= math.ceil(num.revert());

            expectNumEquals(num.round(), roundActual);
            expectNumEquals(num.floor(), floorActual);
            expectNumEquals(num.ceil(), ceilActual);
        };

        it("handles basic numbers", () => {
            check(5);
            check(5.5);
            check(5.4);
            check(5.6);
            check(0);
        });

        it("handles large numbers", () => {
            check(1e30);
        });
    });

    describe("logarithm", () => {
        const check = (n: unknown, base: number, logActual?: unknown) => {
            const num = new Number(n as number);

            logActual ??= math.log(num.revert(), base);
            const ZERO = new Number(0);
            const result = num.log(base)!;
            expectNumEquals(result, logActual); // basic check
            expectNumEquals(num.pow(2).log(base), result.mul(2)); // power rule
            expectNumEquals(new Number(1).log(base), ZERO); // identity property
            expectNumEquals(new Number(base).log(base), 1); // identity property
            expectNumEquals(new Number(base).pow(result), num); // inverse property
        };

        it("handles basic numbers", () => {
            check(5, 10);
            check(5, 5);
            check(5, 2);
            check(200, 10);
            check(200, 6);
        });

        it("handles large numbers", () => {
            check(1e30, 10);
            check(1e30, 2);
            check(1e30, 150);
            check(num(1, 500), 10, 500);
        });
    });
};
