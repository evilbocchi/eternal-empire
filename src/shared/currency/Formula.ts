//!native
import { OnoeNum } from "@antivivi/serikanum";

type Number = number | OnoeNum;
type Operation = {
    type: number;
    amount?: OnoeNum;
    base?: number;
};

const def = new OnoeNum(0);
const HALF = new OnoeNum(1 / 2);
const ONETHIRD = new OnoeNum(1 / 3);
const E = math.exp(1);

// Operation types as bit flags
const OPERATION_ADD = 0x0001;
const OPERATION_SUB = 0x0002;
const OPERATION_MUL = 0x0004;
const OPERATION_DIV = 0x0008;
const OPERATION_POW = 0x0010;
const OPERATION_SQRT = 0x0020;
const OPERATION_CBRT = 0x0040;
const OPERATION_LOG = 0x0080;
const OPERATION_LN = 0x0100;

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
            type: OPERATION_ADD,
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
            type: OPERATION_SUB,
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
            type: OPERATION_MUL,
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
            type: OPERATION_DIV,
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
            type: OPERATION_POW,
            amount: new OnoeNum(number),
        });
        return this;
    }

    /**
     * Applies a square root to the formula.
     * @returns This Formula instance.
     */
    sqrt() {
        this.operations.push({ type: OPERATION_SQRT });
        return this;
    }

    /**
     * Applies a logarithm with the specified base to the formula.
     * @param number The base of the logarithm.
     * @returns This Formula instance.
     */
    log(number: number) {
        this.operations.push({
            type: OPERATION_LOG,
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
            type: OPERATION_LN,
        });
        return this;
    }

    /**
     * Applies the formula's operations to a given OnoeNum value.
     * @param number The input value.
     * @returns The result after applying all operations.
     */
    evaluate(number: OnoeNum) {
        for (const operation of this.operations) {
            switch (operation.type) {
                case OPERATION_ADD:
                    number = number.add(operation.amount!);
                    break;
                case OPERATION_SUB:
                    number = number.sub(operation.amount!);
                    break;
                case OPERATION_MUL:
                    number = number.mul(operation.amount!);
                    break;
                case OPERATION_DIV:
                    number = number.div(operation.amount!);
                    break;
                case OPERATION_POW:
                    number = number.pow(operation.amount!);
                    break;
                case OPERATION_SQRT:
                    number = number.pow(HALF);
                    break;
                case OPERATION_CBRT:
                    number = number.pow(ONETHIRD);
                    break;
                case OPERATION_LOG:
                    number = OnoeNum.log(number, operation.base!) ?? def;
                    break;
                case OPERATION_LN:
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
        let lastOperator: number | undefined;
        for (const operation of this.operations) {
            switch (operation.type) {
                case OPERATION_ADD:
                    nameOfX += " + " + operation.amount;
                    break;
                case OPERATION_SUB:
                    nameOfX += " - " + operation.amount;
                    break;
                case OPERATION_MUL:
                    nameOfX += " * " + operation.amount;
                    break;
                case OPERATION_DIV:
                    nameOfX += " / " + operation.amount;
                    break;
                case OPERATION_POW:
                    if (
                        lastOperator === OPERATION_ADD ||
                        lastOperator === OPERATION_SUB ||
                        lastOperator === OPERATION_MUL ||
                        lastOperator === OPERATION_DIV
                    ) {
                        nameOfX = "(" + nameOfX + ") ^ " + operation.amount;
                    } else {
                        nameOfX += " ^ " + operation.amount;
                    }
                    break;
                case OPERATION_SQRT:
                    nameOfX = "√(" + nameOfX + ")";
                    break;
                case OPERATION_LOG:
                    nameOfX = "log<font size='16'>" + operation.base + "</font>(" + nameOfX + ")";
                    break;
                case OPERATION_LN:
                    nameOfX = "ln(" + nameOfX + ")";
                    break;
            }
            lastOperator = operation.type;
        }
        return nameOfX;
    }
}

export = Formula;
