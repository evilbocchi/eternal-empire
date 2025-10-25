//!native
//!optimize 2
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { IOperative } from "shared/item/traits/Operative";

/**
 * Abstract base class for named upgrades, supporting configuration of name, description, cap, image, price, and formulas.
 * Provides method chaining for configuration and an `apply` method to apply upgrade effects.
 * @template T The value type this upgrade operates on.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default abstract class NamedUpgrade<T = any> {
    types = new Set<string>();
    id!: string;
    name: string | undefined = undefined;
    description: string | undefined = undefined;
    cap: number | undefined = undefined;
    image: string | undefined = undefined;
    step: number | undefined = undefined;
    priceFormula: ((amount: number) => CurrencyBundle) | undefined = undefined;
    stepFormula?: (value: T, effectiveSteps: number) => T;
    mainFormula?: (value: T, amount: number) => T;

    constructor() {}

    /**
     * Sets the display name of the upgrade.
     * @param name The upgrade name.
     * @returns This upgrade instance.
     */
    setName(name: string) {
        this.name = name;
        return this;
    }

    /**
     * Sets the description of the upgrade.
     * @param description The upgrade description.
     * @returns This upgrade instance.
     */
    setDescription(description: string) {
        this.description = description;
        return this;
    }

    /**
     * Sets the cap (maximum level) for the upgrade.
     * @param cap The maximum level.
     * @returns This upgrade instance.
     */
    setCap(cap: number) {
        this.cap = cap;
        return this;
    }

    /**
     * Sets the step value and formula for the upgrade.
     * @param step The step interval.
     * @param stepFormula The formula to apply per step.
     * @returns This upgrade instance.
     */
    setStep(step: number, stepFormula: (value: T, effectiveSteps: number) => T) {
        this.step = step;
        this.stepFormula = stepFormula;
        return this;
    }

    /**
     * Sets the price formula for the upgrade.
     * @param priceFormula The function to calculate price per amount.
     * @returns This upgrade instance.
     */
    setPriceFormula(priceFormula: (amount: number) => CurrencyBundle) {
        this.priceFormula = priceFormula;
        return this;
    }

    /**
     * Gets the price for upgrading from start to endAmount (inclusive).
     * @param start The starting amount.
     * @param endAmount The ending amount (optional).
     * @returns The total price as a CurrencyBundle, or undefined.
     */
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

    /**
     * Sets the main formula for applying the upgrade effect.
     * @param formula The formula function.
     * @returns This upgrade instance.
     */
    setFormula(formula: (value: T, amount: number) => T) {
        this.mainFormula = formula;
        return this;
    }

    /**
     * Sets the image asset for the upgrade.
     * @param image The image asset ID or URL.
     * @returns This upgrade instance.
     */
    setImage(image: string) {
        this.image = image;
        return this;
    }

    /**
     * Applies the upgrade effect to a value, given the upgrade amount.
     * @param value The base value.
     * @param amount The upgrade amount.
     * @returns The upgraded value.
     */
    apply(value: T, amount: number) {
        if (this.step !== undefined && this.stepFormula !== undefined)
            value = this.stepFormula(value, math.floor(amount / this.step));

        if (this.mainFormula !== undefined) value = this.mainFormula(value, amount);

        return value;
    }
}

/**
 * Upgrade class for {@link CurrencyBundle}-related upgrades, supporting multiplicative and power operations.
 */
export class CurrencyBundleUpgrade extends NamedUpgrade<CurrencyBundle> {
    mulFormula?: (upgradeAmount: number) => CurrencyBundle;
    powFormula?: (upgradeAmount: number) => CurrencyBundle;

    /**
     * Sets a step-based multiplicative formula for the upgrade.
     * @param step The step interval.
     * @param formula The formula function.
     * @returns This upgrade instance.
     */
    setStepMul(step: number, formula: (steps: number) => CurrencyBundle) {
        this.step = step;
        this.stepFormula = (value, steps) => value.mul(formula(steps));
        return this;
    }

    /**
     * Sets a multiplicative formula for the upgrade.
     * @param formula The formula function.
     * @returns This upgrade instance.
     */
    setMul(formula: (upgradeAmount: number) => CurrencyBundle) {
        this.mulFormula = formula;
        return this;
    }

    /**
     * Sets a power formula for the upgrade.
     * @param formula The formula function.
     * @returns This upgrade instance.
     */
    setPow(formula: (upgradeAmount: number) => CurrencyBundle) {
        this.powFormula = formula;
        return this;
    }

    getOperative(amount: number): IOperative {
        return {
            mul: this.mulFormula?.(amount),
            pow: this.powFormula?.(amount),
        };
    }

    override apply(value: CurrencyBundle, amount: number) {
        if (this.step !== undefined && this.stepFormula !== undefined)
            value = this.stepFormula(value, math.floor(amount / this.step));

        if (this.mulFormula !== undefined) value = value.mul(this.mulFormula(amount));
        if (this.powFormula !== undefined) value = value.pow(this.powFormula(amount));
        return value;
    }

    /**
     * Returns a string representation of the upgrade effect at a given level.
     * @param level The upgrade level.
     * @returns The effect as a string.
     */
    toString(level: number) {
        let str = "";
        if (this.mulFormula !== undefined) {
            str += `x${this.mulFormula(level).toString()}`;
        }
        if (this.powFormula !== undefined) {
            str += `^${this.powFormula(level).toString()}`;
        }
        return str;
    }
}

/**
 * Upgrade for furnace-type objects.
 */
export class FurnaceUpgrade extends CurrencyBundleUpgrade {
    constructor() {
        super();
        this.types.add("Furnace");
    }
}

/**
 * Upgrade for generator-type objects.
 */
export class GeneratorUpgrade extends CurrencyBundleUpgrade {
    constructor() {
        super();
        this.types.add("Generator");
    }
}

/**
 * Upgrade for reset-type objects.
 */
export class ResetUpgrade extends CurrencyBundleUpgrade {
    constructor() {
        super();
        this.types.add("Reset");
    }
}

/**
 * Upgrade that applies to both furnace and generator types.
 */
export class GainUpgrade extends CurrencyBundleUpgrade {
    constructor() {
        super();
        this.types.add("Furnace");
        this.types.add("Generator");
    }
}

/**
 * Upgrade for purifier-type objects, extending GainUpgrade.
 */
export class PurifierUpgrade extends GainUpgrade {
    constructor() {
        super();
        this.types.add("Purifier");
    }
}

/**
 * Upgrade for walk speed, operating on numbers.
 */
export class WalkSpeedUpgrade extends NamedUpgrade<number> {
    constructor() {
        super();
        this.types.add("WalkSpeed");
    }
}

/**
 * Upgrade for grid size, operating on Vector3 values.
 */
export class GridSizeUpgrade extends NamedUpgrade<Vector3> {
    area: AreaId;

    /**
     * @param area The area identifier this grid size upgrade applies to.
     */
    constructor(area: AreaId) {
        super();
        this.area = area;
        this.types.add("GridSize");
    }
}
