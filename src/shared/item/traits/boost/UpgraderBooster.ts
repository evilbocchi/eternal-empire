import { getAllInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import Boostable from "shared/item/traits/boost/Boostable";
import Booster from "shared/item/traits/boost/Booster";

export default class UpgraderBooster extends Booster {
    /**
     * Creates a modifier token for upgraders in the area of the model.
     *
     * @param boosterModel The model of the upgrader booster.
     * @param whitelist An optional whitelist function to filter which upgraders are affected by this booster.
     * @returns A modifier object that can be used to adjust the upgrade.
     */
    createToken(boosterModel: Model): ItemBoost {
        const key = this.item.id;
        const boost = {
            ignoresLimitations: false,
            upgradeCompound: this,
        };

        let target: Model | undefined;
        this.observeTarget(boosterModel, (upgraderModel, item) => {
            if (target !== undefined && target !== upgraderModel) {
                Boostable.removeBoost(getAllInstanceInfo(target), key);
                target = undefined;
            }

            if (upgraderModel === undefined || item === undefined || !item.isA("Upgrader")) {
                return false;
            }

            target = upgraderModel;
            Boostable.addBoost(getAllInstanceInfo(target), key, boost);

            return true;
        });
        boosterModel.Destroying.Once(() => {
            if (target !== undefined) {
                Boostable.removeBoost(getAllInstanceInfo(target), key);
                target = undefined;
            }
        });
        return boost;
    }

    static load(model: Model, upgraderBooster: UpgraderBooster) {
        upgraderBooster.createToken(model);
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => UpgraderBooster.load(model, this));
    }
}
