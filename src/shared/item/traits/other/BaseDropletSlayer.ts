import { getAllInstanceInfo } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { Workspace } from "@rbxts/services";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import perItemPacket from "shared/item/utils/perItemPacket";

declare global {
    interface ItemBoost {
        cooldownMul?: number;
    }
}

export default abstract class BaseDropletSlayer extends ItemTrait {
    static readonly activatePacket = perItemPacket(packet<(placementId: string) => void>());

    /**
     * Loads the droplet slayer onto the given model.
     * @param model The model to load the droplet slayer onto.
     * @param slayer The droplet slayer to load.
     * @returns An object containing the repeat reference.
     */
    static baseLoad(model: Model, slayer: BaseDropletSlayer, laserIdFactory?: () => string) {
        const item = slayer.item;
        const upgrader = item.trait(Upgrader);
        const modelInfo = getAllInstanceInfo(model);
        modelInfo.Boosts ??= new Map();
        const boosts = modelInfo.Boosts;

        const laser = model.WaitForChild("PulsatingLaser") as BasePart;
        const laserInfo = getAllInstanceInfo(laser);
        laserInfo.Maintained = false;

        const overlapParams = new OverlapParams();
        overlapParams.CollisionGroup = "DropletInquirer";
        const laserCFrame = laser.CFrame;
        const laserSize = laser.Size;

        const ref = item.repeat(
            model,
            () => {
                laserInfo.Maintained = true;
                for (const droplet of Workspace.GetPartBoundsInBox(laserCFrame, laserSize, overlapParams)) {
                    Upgrader.upgrade({
                        model,
                        modelInfo,
                        upgrader,
                        droplet,
                        dropletInfo: getAllInstanceInfo(droplet),
                        laserInfo,
                        laserId: laserIdFactory?.(),
                    });
                }
                laserInfo.Maintained = false;
                this.activatePacket.toAllClients(model);

                let newCooldown = slayer.cooldown;
                for (const [, boost] of boosts) {
                    if (boost.cooldownMul !== undefined) {
                        newCooldown *= boost.cooldownMul;
                    }
                }
                return newCooldown;
            },
            slayer.cooldown,
        );

        return { ref };
    }

    cooldown = 4;

    constructor(item: Item) {
        super(item);
    }

    setCooldown(cd: number) {
        this.cooldown = cd;
        return this;
    }
}
