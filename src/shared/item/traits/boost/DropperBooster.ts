import { getAllInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import Booster from "shared/item/traits/boost/Booster";

declare global {
    interface ItemTraits {
        DropperBooster: DropperBooster;
    }

    interface ItemBoost {
        dropRateMul?: number;
    }
}

export default class DropperBooster extends Booster {
    dropRateMul = 1;

    /**
     * Creates a modifier token for the drop rate of droppers in the area of the model.
     *
     * @param boosterModel The model of the dropper booster.
     * @returns A modifier object that can be used to adjust the drop rate.
     */
    override createToken(boosterModel: Model) {
        const key = this.item.id;
        const modifier: ItemBoost = {
            ignoresLimitations: false,
            dropRateMul: this.dropRateMul,
        };

        let target: BasePart | undefined;

        this.observeTarget(boosterModel, (dropperModel, item) => {
            const drop = dropperModel?.FindFirstChild("Drop");

            if (target !== undefined && target !== drop) {
                Boostable.removeBoost(getAllInstanceInfo(target), key);
                target = undefined;
                return false;
            }

            if (item === undefined || !item.isA("Dropper") || drop === undefined || !drop.IsA("BasePart")) {
                return false;
            }

            target = drop;
            Boostable.addBoost(getAllInstanceInfo(target), key, modifier);
            return true;
        });

        return modifier;
    }

    /**
     * Loads the drop rate multiplier for the booster from the model.
     *
     * @param model The model to load the booster from.
     * @param booster The booster instance to apply the multiplier to.
     */
    static load(model: Model, booster: DropperBooster) {
        booster.createToken(model);
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => DropperBooster.load(model, this));
    }

    setDropRateMul(dropRateMultiplier: number) {
        this.dropRateMul = dropRateMultiplier;
        return this;
    }
}
