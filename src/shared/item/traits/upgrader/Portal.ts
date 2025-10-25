import { getAllInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import isPlacedItemUnusable from "shared/item/utils/isPlacedItemUnusable";
import { VirtualCollision } from "shared/item/utils/VirtualReplication";

declare global {
    interface ItemTraits {
        Portal: Portal;
    }
    interface InstanceInfo {
        /**
         * The last portal this droplet was teleported through.
         */
        lastTeleport?: Portal;
    }
}

export default class Portal extends ItemTrait {
    portalOuts = new Set<BasePart>();

    static load(model: Model, portal: Portal) {
        const modelInfo = getAllInstanceInfo(model);
        const inLaser = model.WaitForChild("In") as BasePart;
        const outLaser = model.WaitForChild("Out") as Part;

        inLaser.CanTouch = true;
        VirtualCollision.onDropletTouched(model, inLaser, (droplet, dropletInfo) => {
            if (dropletInfo.lastTeleport === portal || isPlacedItemUnusable(modelInfo)) {
                return;
            }

            // find out that isnt the current one
            let out: BasePart | undefined;
            for (const part of portal.portalOuts) {
                if (part !== outLaser) {
                    out = part;
                    break;
                }
            }
            if (out === undefined) {
                return;
            }

            dropletInfo.lastTeleport = portal;
            droplet.CFrame = out.CFrame;
        });

        portal.portalOuts.add(outLaser);
        model.Destroying.Once(() => portal.portalOuts.delete(outLaser));
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Portal.load(model, this));
    }
}
