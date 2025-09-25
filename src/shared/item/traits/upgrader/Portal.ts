import { getAllInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import { VirtualCollision } from "shared/item/utils/VirtualReplication";

declare global {
    interface ItemTraits {
        Portal: Portal;
    }
    interface InstanceInfo {
        LastTeleport?: Portal;
    }
}

export default class Portal extends ItemTrait {
    portalOuts = new Set<BasePart>();

    static load(model: Model, portal: Portal) {
        const inLaser = model.WaitForChild("In") as BasePart;
        const outLaser = model.WaitForChild("Out") as Part;
        const inInfo = getAllInstanceInfo(inLaser);

        inLaser.CanTouch = true;
        inInfo.DropletTouched = (droplet: BasePart) => {
            const dropletInfo = getAllInstanceInfo(droplet);
            if (dropletInfo.LastTeleport === portal) {
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

            dropletInfo.LastTeleport = portal;
            droplet.CFrame = out.CFrame;
        };
        VirtualCollision.handleDropletTouched(model, inLaser, inInfo.DropletTouched);

        portal.portalOuts.add(outLaser);
        model.Destroying.Connect(() => portal.portalOuts.delete(outLaser));
    }

    static clientLoad(model: Model, _portal: Portal) {
        const inLaser = model.WaitForChild("In") as BasePart;
        VirtualCollision.listenForDropletTouches(model, inLaser);
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Portal.load(model, this));
        item.onClientLoad((model) => Portal.clientLoad(model, this));
    }
}
