import Price from "shared/Price";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

class NamedUpgrade {

    static UPGRADES: NamedUpgrade[] = [];

    static moreFundsFormula(value: Price, amount: number, step: number | undefined) {
        if (step !== undefined && amount >= step) {
            value = value.mul(new Price().setCost("Funds", new InfiniteMath(1.2).pow(math.floor(amount / step))));
        }
        if (amount > 0) {
            value = value.mul(new Price().setCost("Funds", new InfiniteMath(1.04).pow(amount)));
        }
        return value;
    }

    static morePowerFormula(value: Price, amount: number, step: number | undefined) {
        if (value.getCost("Power")?.equals(0)) {
            return value;
        }
        if (step !== undefined && amount >= step) {
            value = value.mul(new Price().setCost("Power", new InfiniteMath(1.2).pow(math.floor(amount / step))));
        }
        if (amount > 0) {
            value = value.mul(new Price().setCost("Power", new InfiniteMath(1.03).pow(amount)));
        }
        return value;
    }

    static MoreFunds = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("MoreFunds")
        .setName("Improved Droplet Technology")
        .setDescription("Increases droplet Funds value and generator gain by 4% per upgrade compounding. Every 10 upgrades multiplies the upgrade by 1.2x.")
        .setCap(100)
        .setImage(4743601341)
        .setStep(10)
        .setPriceFormula((amount) => {
            return new Price().setCost("Funds", new InfiniteMath([1, 9]).mul(new InfiniteMath(1.55).pow(amount)));
        })
        .setGeneratorFormula((value, amount, step) => NamedUpgrade.moreFundsFormula(value, amount, step))
        .setDropletFormula((value, amount, step) => NamedUpgrade.moreFundsFormula(value, amount, step))
    );

    static MorePower = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("MorePower")
        .setName("Better Networking")
        .setDescription("Increases droplet Power value and generator gain by 3% per upgrade compounding. Every 10 upgrades multiplies the upgrade by 1.2x.")
        .setCap(100)
        .setImage(12600837039)
        .setStep(10)
        .setPriceFormula((amount) => {
            return new Price().setCost("Power", new InfiniteMath([4, 1]).mul(new InfiniteMath(1.45).pow(amount)));
        })
        .setGeneratorFormula((value, amount, step) => NamedUpgrade.morePowerFormula(value, amount, step))
        .setDropletFormula((value, amount, step) => NamedUpgrade.morePowerFormula(value, amount, step))
    );

    static FasterTreading = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("FasterTreading")
        .setName("Fast Treads")
        .setDescription("In case you hate walking, this upgrade increases player walkspeed by 1.")
        .setCap(4)
        .setImage(15657670979)
        .setPriceFormula((amount) => {
            return new Price().setCost("Power", new InfiniteMath([10, amount * 2]));
        })
        .setWalkSpeedFormula((value, amount) => {
            return value + amount;
        })
    );

    static LandReclaimation = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("LandReclaimation")
        .setName("Land Reclaimation")
        .setDescription("Finally, some space. Increases the grid size of Barren Islands by 6 studs each side.")
        .setCap(3)
        .setImage(16800883223)
        .setPriceFormula((amount) => {
            return new Price().setCost("Funds", new InfiniteMath([5, 3 + (amount * 6)]));
        })
        .setGridSizeFormula("BarrenIslands", (value, amount) => {
            const delta = amount * 12;
            return value.add(new Vector3(delta, 0, delta));
        })
    );

    static registerUpgrade(upgrade: NamedUpgrade) {
        NamedUpgrade.UPGRADES.push(upgrade);
        return upgrade;
    }

    id: string;
    name: string | undefined = undefined;
    description: string | undefined = undefined;
    cap: number | undefined = undefined;
    image: number | undefined = undefined;
    step: number | undefined = undefined;
    priceFormula: ((amount: number) => Price) | undefined = undefined;
    walkSpeedFormula: ((val: number, amount: number, step?: number) => number) | undefined = undefined;
    gridSizeFormula: Map<string, ((val: Vector3, amount: number, step?: number) => Vector3)> = new Map();
    dropletFormula: ((val: Price, amount: number, step?: number) => Price) | undefined = undefined;
    generatorFormula: ((val: Price, amount: number, step?: number) => Price) | undefined = undefined;

    constructor(id: string) {
        this.id = id;
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    getDescription() {
        return this.description;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    getCap() {
        return this.cap;
    }

    setCap(cap: number) {
        this.cap = cap;
        return this;
    }

    getStep() {
        return this.step;
    }

    setStep(step: number) {
        this.step = step;
        return this;
    }
    
    getPriceFormula() {
        return this.priceFormula; 
    }

    setPriceFormula(priceFormula: (amount: number) => Price) {
        this.priceFormula = priceFormula;
        return this;
    }

    getPrice(start: number, endAmount?: number) {
        const formula = this.getPriceFormula();
        if (formula === undefined) {
            return;
        }
        if (endAmount === undefined || start === endAmount) {
            return formula(start);
        }
        let price = new Price();
        for (let i = start; i <= endAmount; i++) {
            price = price.add(formula(i));
        }
        return price;
    }

    getWalkSpeedFormula() {
        return this.walkSpeedFormula; 
    }

    setWalkSpeedFormula(walkSpeedFormula: (walkSpeed: number, amount: number, step?: number) => number) {
        this.walkSpeedFormula = walkSpeedFormula;
        return this;
    }

    getGridSizeFormula(area: string) {
        return this.gridSizeFormula.get(area); 
    }

    setGridSizeFormula(area: string, gridSizeFormula: (gridSize: Vector3, amount: number, step?: number) => Vector3) {
        this.gridSizeFormula.set(area, gridSizeFormula);
        return this;
    }

    getDropletFormula() {
        return this.dropletFormula; 
    }

    setDropletFormula(dropletFormula: (dropletValue: Price, amount: number, step?: number) => Price) {
        this.dropletFormula = dropletFormula;
        return this;
    }

    getGeneratorFormula() {
        return this.generatorFormula; 
    }

    setGeneratorFormula(generatorFormula: (generatorGain: Price, amount: number, step?: number) => Price) {
        this.generatorFormula = generatorFormula;
        return this;
    }

    getImage() {
        return this.image;
    }

    setImage(image: number) {
        this.image = image;
        return this;
    }

    static getUpgrade(upgradeId: string) {
        for (const upgrade of NamedUpgrade.UPGRADES) {
            if (upgrade.id === upgradeId)
                return upgrade;
        }
        return undefined;
    }
}

export = NamedUpgrade;