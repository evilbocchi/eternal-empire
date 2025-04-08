//!native
//!optimize 2
import CurrencyBundle from "shared/currency/CurrencyBundle";

export default abstract class NamedUpgrade<T = any> {

    types = new Set<string>();
    id!: string;
    name: string | undefined = undefined;
    description: string | undefined = undefined;
    cap: number | undefined = undefined;
    image: number | undefined = undefined;
    step: number | undefined = undefined;
    priceFormula: ((amount: number) => CurrencyBundle) | undefined = undefined;
    stepFormula?: (value: T, effectiveSteps: number) => T;
    mainFormula?: (value: T, amount: number) => T;

    constructor() {
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    setCap(cap: number) {
        this.cap = cap;
        return this;
    }

    setStep(step: number, stepFormula: (value: T, effectiveSteps: number) => T) {
        this.step = step;
        this.stepFormula = stepFormula;
        return this;
    }

    setPriceFormula(priceFormula: (amount: number) => CurrencyBundle) {
        this.priceFormula = priceFormula;
        return this;
    }

    getPrice(start: number, endAmount?: number) {
        const formula = this.priceFormula;
        if (formula === undefined) {
            return;
        }
        if (endAmount === undefined || start === endAmount) {
            return formula(start);
        }
        let price = new CurrencyBundle();
        for (let i = start; i <= endAmount; i++) {
            price = price.add(formula(i));
        }
        return price;
    }

    setFormula(formula: (value: T, amount: number) => T) {
        this.mainFormula = formula;
        return this;
    }

    setImage(image: number) {
        this.image = image;
        return this;
    }

    apply(value: T, amount?: number) {
        if (amount === 0 || amount === undefined)
            return value;
        if (this.step !== undefined && this.stepFormula !== undefined)
            value = this.stepFormula(value, math.floor(amount / this.step));
        if (this.mainFormula !== undefined)
            value = this.mainFormula(value, amount);
        return value;
    }

}

type PriceAmountFunction = (arg: number) => CurrencyBundle;
export class PriceUpgrade extends NamedUpgrade<CurrencyBundle> {
    operative?: "add" | "mul" | "pow";
    operationFormula?: PriceAmountFunction;

    setStepMul(step: number, formula: PriceAmountFunction) {
        this.step = step;
        this.stepFormula = (y, x) => y.mul(formula(x));
        return this;
    }

    setMul(formula: PriceAmountFunction) {
        this.operative = "mul";
        this.operationFormula = formula;
        this.mainFormula = (y, x) => y.mul(formula(x));
        return this;
    }

    setPow(formula: PriceAmountFunction) {
        this.operative = "pow";
        this.operationFormula = formula;
        this.mainFormula = (y, x) => y.pow(formula(x));
        return this;
    }

    toString(level: number) {
        if (this.operationFormula === undefined)
            return "";
        let prefix: string;
        switch (this.operative) {
            case "add":
                prefix = "+";
                break;
            case "mul":
                prefix = "x";
                break;
            case "pow":
                prefix = "^";
                break;
            default:
                prefix = "";
                break;
        }
        return prefix + this.operationFormula(level).toString();
    }
}

export class FurnaceUpgrade extends PriceUpgrade {
    constructor() {
        super();
        this.types.add("Furnace");
    }
}

export class GeneratorUpgrade extends PriceUpgrade {
    constructor() {
        super();
        this.types.add("Generator");
    }
}

export class ResetUpgrade extends PriceUpgrade {
    constructor() {
        super();
        this.types.add("Reset");
    }
}

export class GainUpgrade extends PriceUpgrade {
    constructor() {
        super();
        this.types.add("Furnace");
        this.types.add("Generator");
    }
}

export class PurifierUpgrade extends GainUpgrade {
    constructor() {
        super();
        this.types.add("Purifier");
    }
}

export class WalkSpeedUpgrade extends NamedUpgrade<number> {
    constructor() {
        super();
        this.types.add("WalkSpeed");
    }
}

export class GridSizeUpgrade extends NamedUpgrade<Vector3> {
    area: AreaId;

    constructor(area: AreaId) {
        super();
        this.area = area;
        this.types.add("GridSize");
    }
}
