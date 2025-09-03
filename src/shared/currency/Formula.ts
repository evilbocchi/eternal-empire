//!native
import { OnoeNum } from "@antivivi/serikanum";

type Number = number | OnoeNum;
type Operation = {
    type: string;
    amount?: OnoeNum;
    base?: number;
};

const def = new OnoeNum(0);
const HALF = new OnoeNum(1 / 2);
const ONETHIRD = new OnoeNum(1 / 3);
const E = math.exp(1);

/**
 * Represents a chainable mathematical formula composed of operations.
 * Supports addition, subtraction, multiplication, division, powers, roots, and logarithms.
 */
class Formula {
    operations = new Array<Operation>();

    constructor() {}

    /**
     * Adds a value to the formula.
     * @param number The value to add.
     * @returns This Formula instance.
     */
    add(number: Number) {
        this.operations.push({
            type: "add",
            amount: new OnoeNum(number),
        });
        return this;
    }

    /**
     * Subtracts a value from the formula.
     * @param number The value to subtract.
     * @returns This Formula instance.
     */
    sub(number: Number) {
        this.operations.push({
            type: "sub",
            amount: new OnoeNum(number),
        });
        return this;
    }

    /**
     * Multiplies the formula by a value.
     * @param number The value to multiply by.
     * @returns This Formula instance.
     */
    mul(number: Number) {
        this.operations.push({
            type: "mul",
            amount: new OnoeNum(number),
        });
        return this;
    }

    /**
     * Divides the formula by a value.
     * @param number The value to divide by.
     * @returns This Formula instance.
     */
    div(number: Number) {
        this.operations.push({
            type: "div",
            amount: new OnoeNum(number),
        });
        return this;
    }

    /**
     * Raises the formula to the power of a value.
     * @param number The exponent.
     * @returns This Formula instance.
     */
    pow(number: Number) {
        this.operations.push({
            type: "pow",
            amount: new OnoeNum(number),
        });
        return this;
    }

    /**
     * Applies a square root to the formula.
     * @returns This Formula instance.
     */
    sqrt() {
        this.operations.push({ type: "sqrt" });
        return this;
    }

    /**
     * Applies a logarithm with the specified base to the formula.
     * @param number The base of the logarithm.
     * @returns This Formula instance.
     */
    log(number: number) {
        this.operations.push({
            type: "log",
            base: number,
        });
        return this;
    }

    /**
     * Applies a natural logarithm (ln) to the formula.
     * @returns This Formula instance.
     */
    ln() {
        this.operations.push({
            type: "ln",
        });
        return this;
    }

    /**
     * Applies the formula's operations to a given OnoeNum value.
     * @param number The input value.
     * @returns The result after applying all operations.
     */
    apply(number: OnoeNum) {
        for (const operation of this.operations) {
            switch (operation.type) {
                case "add":
                    number = number.add(operation.amount!);
                    break;
                case "sub":
                    number = number.sub(operation.amount!);
                    break;
                case "mul":
                    number = number.mul(operation.amount!);
                    break;
                case "div":
                    number = number.div(operation.amount!);
                    break;
                case "pow":
                    number = number.pow(operation.amount!);
                    break;
                case "sqrt":
                    number = number.pow(HALF);
                    break;
                case "cbrt":
                    number = number.pow(ONETHIRD);
                    break;
                case "log":
                    number = OnoeNum.log(number, operation.base!) ?? def;
                    break;
                case "ln":
                    number = OnoeNum.log(number, E) ?? def;
                    break;
            }
        }
        return number;
    }

    /**
     * Returns a string representation of the formula, using the provided variable name.
     * @param nameOfX The variable name to use (e.g., "x").
     * @returns The formula as a string.
     */
    tostring(nameOfX: string) {
        let lastOperator: string | undefined;
        for (const operation of this.operations) {
            switch (operation.type) {
                case "add":
                    nameOfX += " + " + operation.amount;
                    break;
                case "sub":
                    nameOfX += " - " + operation.amount;
                    break;
                case "mul":
                    nameOfX += " * " + operation.amount;
                    break;
                case "div":
                    nameOfX += " / " + operation.amount;
                    break;
                case "pow":
                    if (
                        lastOperator === "add" ||
                        lastOperator === "sub" ||
                        lastOperator === "mul" ||
                        lastOperator === "div"
                    ) {
                        nameOfX = "(" + nameOfX + ") ^ " + operation.amount;
                    } else {
                        nameOfX += " ^ " + operation.amount;
                    }
                    break;
                case "sqrt":
                    nameOfX = "√(" + nameOfX + ")";
                    break;
                case "log":
                    nameOfX = "log<font size='16'>" + operation.base + "</font>(" + nameOfX + ")";
                    break;
                case "ln":
                    nameOfX = "ln(" + nameOfX + ")";
                    break;
            }
            lastOperator = operation.type;
        }
        return nameOfX;
    }
}

export = Formula;
