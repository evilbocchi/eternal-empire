import { OnoeNum } from "@antivivi/serikanum";

type Number = number | OnoeNum;
type Operation = {
    type: string,
    amount?: OnoeNum,
    base?: number,
}

const def = new OnoeNum(0);

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

    log(number: number) {
        this.operations.push({
            type: "log",
            base: number
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
                case "log":
                    number = OnoeNum.log(number, operation.base!) ?? def;
                    break;
            }
        }
        return number;
    }

    tostring(nameOfX: string) {
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
                    nameOfX += " ^ " + operation.amount;
                    break;
                case "log":
                    nameOfX = "log" + operation.base + "(" + nameOfX + ")";
                    break;
            }
        }
        return nameOfX;
    }
}

export = Formula;