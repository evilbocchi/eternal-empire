import { getAllInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import Booster from "shared/item/traits/boost/Booster";

export default class UpgraderBooster extends Booster {

    /**
     * Creates a modifier token for upgraders in the area of the model.
     * 
     * @param model The model of the upgrader booster.
     * @param whitelist An optional whitelist function to filter which upgraders are affected by this booster.
     * @returns A modifier object that can be used to adjust the upgrade.
     */
    createToken(model: Model): ItemBoost {
        const key = model.GetAttribute("ItemId") as string;
        const boost = {
            placementId: model.Name,
            ignoresLimitations: false,
            upgradeCompound: this
        };

        let target: Model | undefined;
        this.observeTarget(model, (upgraderModel, item) => {
            if (upgraderModel === undefined || item === undefined) {
                if (target !== undefined) {
                    getAllInstanceInfo(target).Boosts?.delete(key);
                }
                return false;
            }

            if (!item.isA("Upgrader"))
                return false;

            target = upgraderModel;
            getAllInstanceInfo(target).Boosts?.set(key, boost);

            return true;
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