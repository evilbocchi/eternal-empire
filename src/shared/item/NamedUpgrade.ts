//!native

import Price from "shared/Price";
import { AREAS } from "shared/constants";
import { OnoeNum } from "@antivivi/serikanum";

const fivePercent = new OnoeNum(0.05);
const one = new OnoeNum(1);

class NamedUpgrade {

    static UPGRADES: NamedUpgrade[] = [];

    static Stone = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("Stone")
        .setDescription("Boosts Funds processing value in all furnaces by 5%.")
        .setDropletFormula((value, amount) => value.mul(new Price().setCost("Funds", fivePercent.mul(amount).add(one))))
    );

    static WhiteGem = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("WhiteGem")
        .setDescription("Boosts Power gain in all generators by 5%.")
        .setGeneratorFormula((value, amount) => value.mul(new Price().setCost("Power", fivePercent.mul(amount).add(one))))
    );

    static Crystal = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("Crystal")
        .setDescription("Boosts Skill gain by 5%.")
        .setResetFormula((value, amount) => value.mul(new Price().setCost("Skill", fivePercent.mul(amount).add(one))))
    );

    static MoreFunds = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("MoreFunds")
        .setName("Improved Droplet Technology")
        .setDescription("Increases Funds gain by 4% per upgrade compounding. Every 10 upgrades multiplies the upgrade by 1.2x.")
        .setCap(100)
        .setImage(17567361523)
        .setStep(10)
        .setPriceFormula((amount) => new Price().setCost("Funds", OnoeNum.fromSerika(1, 9).mul(new OnoeNum(1.55).pow(amount))))
        .setGain((value, amount, step) => {
            if (step !== undefined && amount >= step)
                value = value.mul(new Price().setCost("Funds", new OnoeNum(1.2).pow(math.floor(amount / step))));
            if (amount > 0)
                value = value.mul(new Price().setCost("Funds", new OnoeNum(1.04).pow(amount)));
            return value;
        })
    );

    static MorePower = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("MorePower")
        .setName("Better Networking")
        .setDescription("Increases Power gain by 3% per upgrade compounding. Every 10 upgrades multiplies the upgrade by 1.2x.")
        .setCap(100)
        .setImage(17567361376)
        .setStep(10)
        .setPriceFormula((amount) => new Price().setCost("Power", OnoeNum.fromSerika(4, 1).mul(new OnoeNum(1.45).pow(amount))))
        .setGain((value, amount, step) => {
            if (value.getCost("Power")?.equals(0))
                return value;
            if (step !== undefined && amount >= step)
                value = value.mul(new Price().setCost("Power", new OnoeNum(1.2).pow(math.floor(amount / step))));
            if (amount > 0)
                value = value.mul(new Price().setCost("Power", new OnoeNum(1.03).pow(amount)));
            return value;
        })
    );

    static FasterTreading = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("FasterTreading")
        .setName("Fast Treads")
        .setDescription("In case you hate walking, this upgrade increases player walkspeed by 1.")
        .setCap(4)
        .setImage(17567361098)
        .setPriceFormula((amount) => new Price().setCost("Power", OnoeNum.fromSerika(10, amount * 2)))
        .setWalkSpeedFormula((value, amount) => value + amount)
    );

    static LandReclaimation = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("LandReclaimation")
        .setName("Land Reclaimation")
        .setDescription("Finally, some space. Increases the grid size of Barren Islands by 6 studs each side.")
        .setCap(5)
        .setImage(17567364321)
        .setPriceFormula((amount) => new Price().setCost("Funds", OnoeNum.fromSerika(5, 3 + (amount * 6))))
        .setGridSizeFormula("BarrenIslands", (value, amount) => {
            const delta = amount * 12;
            return value.add(new Vector3(delta, 0, delta));
        })
    );

    static CryptographicFunds = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("CryptographicFunds")
        .setName("Cryptographic Funds")
        .setDescription("Increases Funds gain by 5% per upgrade compounding. Every 10 upgrades multiplies the upgrade by 1.25x.")
        .setCap(100)
        .setImage(17567394388)
        .setStep(10)
        .setPriceFormula((amount) => new Price().setCost("Bitcoin", new OnoeNum(20).mul(new OnoeNum(1.75).pow(amount))))
        .setGain((value, amount, step) =>  {
            if (step !== undefined && amount >= step) {
                value = value.mul(new Price().setCost("Funds", new OnoeNum(1.25).pow(math.floor(amount / step))));
            }
            if (amount > 0) {
                value = value.mul(new Price().setCost("Funds", new OnoeNum(1.05).pow(amount)));
            }
            return value;
        })
    );

    static CryptographicPower = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("CryptographicPower")
        .setName("Cryptographic Power")
        .setDescription("Increases Power gain by 4% per upgrade compounding. Every 10 upgrades multiplies the upgrade by 1.25x.")
        .setCap(100)
        .setImage(17567405360)
        .setStep(10)
        .setPriceFormula((amount) => new Price().setCost("Bitcoin", new OnoeNum(35).mul(new OnoeNum(1.75).pow(amount))))
        .setGain((value, amount, step) =>  {
            if (step !== undefined && amount >= step) {
                value = value.mul(new Price().setCost("Funds", new OnoeNum(1.25).pow(math.floor(amount / step))));
            }
            if (amount > 0) {
                value = value.mul(new Price().setCost("Funds", new OnoeNum(1.04).pow(amount)));
            }
            return value;
        })
    );

    static SkilledMining = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("SkilledMining")
        .setName("Skilled Mining")
        .setDescription("Increases Bitcoin gain by 10% per upgrade compounding. Every 10 upgrades multiplies the upgrade by 1.2x.")
        .setCap(100)
        .setImage(17567487942)
        .setStep(10)
        .setPriceFormula((amount) => new Price().setCost("Skill", new OnoeNum(2).mul(new OnoeNum(1.55).pow(amount))))
        .setGain((value, amount, step) =>  {
            if (step !== undefined && amount >= step) {
                value = value.mul(new Price().setCost("Bitcoin", new OnoeNum(1.2).pow(math.floor(amount / step))));
            }
            if (amount > 0) {
                value = value.mul(new Price().setCost("Bitcoin", new OnoeNum(1.1).pow(amount)));
            }
            return value;
        })
    );

    static LandReclaimationII = NamedUpgrade.registerUpgrade(
        new NamedUpgrade("LandReclaimationII")
        .setName("Land Reclaimation II")
        .setDescription("Increases the grid size of Slamo Village by 3 studs each side.")
        .setCap(5)
        .setImage(17705772522)
        .setPriceFormula((amount) => new Price().setCost("Skill", OnoeNum.fromSerika(5, (amount * 6) - 6)))
        .setGridSizeFormula("SlamoVillage", (value, amount) => {
            const delta = amount * 6;
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
    resetFormula: ((val: Price, amount: number, step?: number) => Price) | undefined = undefined;

    constructor(id: string) {
        this.id = id;
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

    setStep(step: number) {
        this.step = step;
        return this;
    }

    setPriceFormula(priceFormula: (amount: number) => Price) {
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
        let price = new Price();
        for (let i = start; i <= endAmount; i++) {
            price = price.add(formula(i));
        }
        return price;
    }

    setWalkSpeedFormula(walkSpeedFormula: (walkSpeed: number, amount: number, step?: number) => number) {
        this.walkSpeedFormula = walkSpeedFormula;
        return this;
    }

    getGridSizeFormula(area: keyof (typeof AREAS)) {
        return this.gridSizeFormula.get(area); 
    }

    setGridSizeFormula(area: keyof (typeof AREAS), gridSizeFormula: (gridSize: Vector3, amount: number, step?: number) => Vector3) {
        this.gridSizeFormula.set(area, gridSizeFormula);
        return this;
    }

    setGain(gain: (original: Price, amount: number, step?: number) => Price) {
        return this.setDropletFormula(gain).setGeneratorFormula(gain);
    }

    setDropletFormula(dropletFormula: (dropletValue: Price, amount: number, step?: number) => Price) {
        this.dropletFormula = dropletFormula;
        return this;
    }

    setGeneratorFormula(generatorFormula: (generatorGain: Price, amount: number, step?: number) => Price) {
        this.generatorFormula = generatorFormula;
        return this;
    }

    setResetFormula(resetFormula: (gain: Price, amount: number, step?: number) => Price) {
        this.resetFormula = resetFormula;
        return this;
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