//!native
import { OnoeNum } from "@antivivi/serikanum";

type Number = number | OnoeNum;
type Operation = {
    type: string,
    amount?: OnoeNum,
    base?: number,
}

const def = new OnoeNum(0);
const HALF = new OnoeNum(1/2);
const ONETHIRD = new OnoeNum(1/3);
const E = math.exp(1);

class Formula {

    operations = new Array<Operation>();

    constructor() {
        
    }

    add(number: Number) {
        this.operations.push({
            type: "add",
            amount: new OnoeNum(number)
        });
        return this;
    }

    sub(number: Number) {
        this.operations.push({
            type: "sub",
            amount: new OnoeNum(number)
        });
        return this;
    }

    mul(number: Number) {
        this.operations.push({
            type: "mul",
            amount: new OnoeNum(number)
        });
        return this;
    }

    div(number: Number) {
        this.operations.push({
            type: "div",
            amount: new OnoeNum(number)
        });
        return this;
    }

    pow(number: Number) {
        this.operations.push({
            type: "pow",
            amount: new OnoeNum(number)
        });
        return this;
    }

    sqrt() {
        this.operations.push({type: "sqrt"});
        return this;
    }

    log(number: number) {
        this.operations.push({
            type: "log",
            base: number
        });
        return this;
    }

    ln() {
        this.operations.push({
            type: "ln"
        });
        return this;
    }

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
                    if (lastOperator === "add" || lastOperator === "sub" || lastOperator === "mul" || lastOperator === "div") {
                        nameOfX = "(" + nameOfX + ") ^ " + operation.amount;
                    }
                    else {
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