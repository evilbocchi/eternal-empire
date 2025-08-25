import { OnInit, Service } from "@flamework/core";
import { CollectionService } from "@rbxts/services";
import EventService from "server/services/data/EventService";
import ItemService from "server/services/item/ItemService";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

@Service()
export default class GrabbableService implements OnInit {

    constructor(
        private readonly eventService: EventService,
        private readonly itemService: ItemService,
    ) { }

    onInit() {
        for (const proximityPrompt of CollectionService.GetTagged("Grabbable")) {
            if (!proximityPrompt.IsA("ProximityPrompt"))
                continue;
            const parent = proximityPrompt.Parent;
            if (parent === undefined)
                continue;
            if (!parent.IsA("BasePart")) {
                warn("ProximityPrompt parent is not a BasePart");
                continue;
            }
            const itemId = parent.Name;
            const item = Items.getItem(itemId);
            if (item === undefined) {
                warn(`Item with ID ${itemId} not found`);
                continue;
            }

            if (parent.Color === Color3.fromRGB(0, 255, 255) && parent.Transparency === 0.5) {
                const model = item.MODEL?.Clone();
                if (model) {
                    model.PivotTo(parent.CFrame);
                    model.Parent = parent;
                }
            }

            const eventId = itemId + "_grabbed";
            if (this.eventService.isEventCompleted(eventId)) {
                proximityPrompt.Parent?.Destroy();
                return;
            }

            proximityPrompt.Triggered.Connect((player) => {
                if (this.eventService.isEventCompleted(eventId)) {
                    return;
                }

                this.eventService.setEventCompleted(eventId, true);
                this.itemService.giveItem(itemId, 1);
                Packets.showItemReward.fire(player, new Map([[itemId, 1]]));
                proximityPrompt.Parent?.Destroy();
            });
        }
    }
}