import { getAllInstanceInfo } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { Debris } from "@rbxts/services";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import Operative from "shared/item/traits/Operative";
import perItemPacket from "shared/item/utils/perItemPacket";

declare global {
    interface ItemTraits {
        Charger: Charger;
    }

    interface ItemBoost {
        /**
         * The charger that is boosting this generator model.
         */
        chargedBy?: Charger;
    }

    interface InstanceInfo {
        /** Whether the item model can be charged by a charger. */
        Chargeable?: boolean;
    }
}

const generatorChangedPacket =
    perItemPacket(packet<(placementId: string, generatorPlacementId: string, added: boolean) => void>());
const currentGeneratorsPacket = perItemPacket(packet<(placementId: string) => string[]>());

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

        const charging = new Set<Instance>();
        const area = model.GetAttribute("Area");
        const checkAdd = (generatorModel: Instance) => {
            if (!generatorModel.IsA("Model")) return;

            const generatorInfo = getAllInstanceInfo(generatorModel);
            if (generatorInfo.Chargeable !== true) return;

            const generatorHitbox = generatorModel.PrimaryPart;
            if (
                generatorHitbox === undefined ||
                generatorModel.GetAttribute("Area") !== area ||
                !this.isInRange(charger, chargerHitbox, generatorHitbox)
            )
                return;

            const boosts = generatorInfo.Boosts;
            if (boosts === undefined || boosts.has(placementId)) return;

            const whitelist = generatorInfo.Generator!.whitelist;
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
            Generator.addBoost(generatorInfo, placementId, {
                ignoresLimitations: charger.ignoreLimit,
                chargedBy: charger,
            });
            generatorChangedPacket.toAllClients(model, generatorModel.Name, true);
        };
        const checkRemove = (generatorModel: Instance) => {
            if (!generatorModel.IsA("Model")) return;
            charging.delete(generatorModel);
            const instanceInfo = getAllInstanceInfo(generatorModel);
            Generator.removeBoost(instanceInfo, placementId);
            generatorChangedPacket.toAllClients(model, generatorModel.Name, false);
        };

        currentGeneratorsPacket.fromClient(model, () => {
            return [...charging].map((g) => g.Name);
        });

        for (const m of PLACED_ITEMS_FOLDER.GetChildren()) {
            task.spawn(() => checkAdd(m));
        }
        const connection1 = PLACED_ITEMS_FOLDER.ChildAdded.Connect(checkAdd);
        const connection2 = PLACED_ITEMS_FOLDER.ChildRemoved.Connect(checkRemove);
        model.Destroying.Connect(() => {
            connection1.Disconnect();
            connection2.Disconnect();
            // Explicitly notify clients to remove VFX for all charged generators
            for (const m of charging) {
                // Remove boost and send packet to clients
                charging.delete(m);
                const instanceInfo = getAllInstanceInfo(m);
                Generator.removeBoost(instanceInfo, placementId);
                generatorChangedPacket.toAllClients(model, m.Name, false);
            }
        });
    }

    static clientLoad(model: Model) {
        const connection = model.FindFirstChild("ConnectionVFX");
        if (connection !== undefined) {
            connection.Parent = script;
        }
        const chargerMarker = model.FindFirstChild("Marker");
        const connectionName = "ConnectionVFX" + model.Name;

        const chargerHitbox = model.PrimaryPart;
        if (chargerHitbox === undefined) return;

        const checkAdd = (generatorModel: Instance) => {
            if (!generatorModel.IsA("Model")) return;
            const generatorHitbox = generatorModel.PrimaryPart;
            if (generatorHitbox === undefined) return;

            if (connection !== undefined) {
                if (generatorModel.FindFirstChild(connectionName) === undefined) {
                    const c = connection.Clone();
                    const start = c.WaitForChild("Start") as Attachment;
                    const e = c.WaitForChild("End") as Attachment;
                    start.Parent = chargerMarker ?? chargerHitbox;
                    e.Parent = generatorModel.FindFirstChild("Marker") ?? generatorHitbox;
                    c.Name = connectionName;
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
            const connectionVFX = generatorModel.FindFirstChild("ConnectionVFX" + connectionName);
            if (connectionVFX !== undefined) {
                connectionVFX.ClearAllChildren();
                Debris.AddItem(connectionVFX, 0.5);
            }
        };

        generatorChangedPacket.fromServer(model, (generatorPlacementId, added) => {
            const generatorModel = PLACED_ITEMS_FOLDER.WaitForChild(generatorPlacementId, 1);
            if (generatorModel === undefined) return;
            if (added) {
                checkAdd(generatorModel);
            } else {
                checkRemove(generatorModel);
            }
        });

        const current = currentGeneratorsPacket.toServer(model);
        if (current !== undefined) {
            for (const generatorPlacementId of current) {
                const generatorModel = PLACED_ITEMS_FOLDER.FindFirstChild(generatorPlacementId);
                if (generatorModel === undefined) continue;
                checkAdd(generatorModel);
            }
        }
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
        item.onClientLoad((model) => Charger.clientLoad(model));
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
