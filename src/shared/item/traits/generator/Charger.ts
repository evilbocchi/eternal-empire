import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Debris } from "@rbxts/services";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import Operative from "shared/item/traits/Operative";

declare global {
    interface ItemTraits {
        Charger: Charger;
    }

    interface ItemBoost {
        /**
         * The charger that is boosting the generator.
         */
        charger?: Charger;
    }
}

/**
 * A charger is an item that 'charges' generators, giving them a boost in {@link Generator.passiveGain}.
 */
export default class Charger extends Operative {
    static isInRange(charger: Charger, chargerHitbox: BasePart, generatorHitbox: BasePart) {
        const radius = charger.radius + chargerHitbox.Size.X / 2;
        const hPos = generatorHitbox.Position;
        const hitboxPos = chargerHitbox.Position;
        const xDiff = hPos.X - hitboxPos.X;
        const zDiff = hPos.Z - hitboxPos.Z;
        return xDiff * xDiff + zDiff * zDiff <= radius * radius;
    }

    /**
     * Loads the charger onto the given model.
     *
     * @param model The model to load the charger onto.
     * @param charger The charger to load.
     */
    static load(model: Model, charger: Charger) {
        const chargerId = charger.item.id;
        const placementId = model.Name;

        const chargerHitbox = model.PrimaryPart;
        if (chargerHitbox === undefined) return;

        const connection = model.FindFirstChild("ConnectionVFX");
        if (connection !== undefined) {
            connection.Parent = script;
        }

        const charging = new Set<Instance>();
        const chargerMarker = model.FindFirstChild("Marker");
        const area = model.GetAttribute("Area");
        const checkAdd = (generatorModel: Instance) => {
            if (!generatorModel.IsA("Model")) return;

            const generatorHitbox = generatorModel.PrimaryPart;
            if (
                generatorHitbox === undefined ||
                generatorModel.GetAttribute("Area") !== area ||
                !this.isInRange(charger, chargerHitbox, generatorHitbox)
            )
                return;

            const generatorInfo = getAllInstanceInfo(generatorModel);
            const boosts = generatorInfo.Boosts;
            if (boosts === undefined || boosts.has(placementId)) return;

            const whitelist = generatorInfo.Boostable!.whitelist;
            if (!whitelist.isEmpty() && !whitelist.has(chargerId)) return;

            if (charger.ignoreLimit !== true) {
                let existing = 0;
                for (const [_, boost] of boosts) {
                    if (!boost.ignoresLimitations) ++existing;
                }

                if (existing > 1) {
                    generatorInfo.BoostRemoved!.add(() => checkAdd(generatorModel));
                    return;
                }
            }

            charging.add(generatorModel);
            Generator.addBoost(generatorInfo, {
                placementId: placementId,
                ignoresLimitations: charger.ignoreLimit,
                charger,
            });

            if (connection !== undefined) {
                const name = "ConnectionVFX" + model.Name;
                if (generatorModel.FindFirstChild(name) === undefined) {
                    const c = connection.Clone();
                    const start = c.WaitForChild("Start") as Attachment;
                    const e = c.WaitForChild("End") as Attachment;
                    start.Parent = chargerMarker ?? chargerHitbox;
                    e.Parent = generatorModel.FindFirstChild("Marker") ?? generatorHitbox;
                    c.Name = name;
                    c.Parent = generatorModel;
                    start.Position = new Vector3();
                    e.Position = new Vector3();
                    c.Destroying.Once(() => {
                        start.Destroy();
                        e.Destroy();
                    });
                }
            }
        };
        const checkRemove = (generatorModel: Instance) => {
            if (!generatorModel.IsA("Model")) return;
            charging.delete(generatorModel);
            const instanceInfo = getAllInstanceInfo(generatorModel);
            Generator.removeBoost(instanceInfo, placementId);

            const connectionVFX = generatorModel.FindFirstChild("ConnectionVFX" + placementId);
            if (connectionVFX !== undefined) {
                connectionVFX.ClearAllChildren();
                Debris.AddItem(connectionVFX, 0.5);
            }
        };

        for (const m of PLACED_ITEMS_FOLDER.GetChildren()) {
            task.spawn(() => checkAdd(m));
        }
        const connection1 = PLACED_ITEMS_FOLDER.ChildAdded.Connect((m) => checkAdd(m));
        const connection2 = PLACED_ITEMS_FOLDER.ChildRemoved.Connect((m) => checkRemove(m));
        model.Destroying.Connect(() => {
            connection1.Disconnect();
            connection2.Disconnect();
            for (const m of charging) {
                checkRemove(m);
            }
        });
    }

    /**
     * Whether the charger ignores the limit of two chargers per generator.
     */
    ignoreLimit = false;

    /**
     * The maximum distance from the generator that the charger can charge.
     */
    radius = 0;

    /**
     * Constructs a new charger.
     *
     * @param item The item to which this charger belongs.
     */
    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Charger.load(model, this));
    }

    /**
     * Sets whether the charger ignores the limit of two chargers per generator.
     *
     * @param ignoreLimit Whether the charger ignores the limit of two chargers per generator.
     * @returns This charger.
     */
    ignoresLimit(ignoreLimit: boolean) {
        this.ignoreLimit = ignoreLimit;
        return this;
    }

    /**
     * Sets the maximum distance from the generator that the charger can charge.
     *
     * @param radius The maximum distance from the generator that the charger can charge.
     * @returns This charger.
     */
    setRadius(radius: number) {
        this.radius = radius;
        return this;
    }

    format(str: string) {
        str = super.format(str);
        str = str.gsub("%%radius%%", this.radius)[0];
        return str;
    }
}
