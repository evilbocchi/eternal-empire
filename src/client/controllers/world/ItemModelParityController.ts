import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

@Controller()
export default class ItemModelParityController implements OnInit {

    onInit() {
        Packets.placedItems.observe((placedItems) => {
            for (const child of PLACED_ITEMS_FOLDER.GetChildren()) {
                if (!placedItems.has(child.Name) && !child.HasTag("Placing")) {
                    child.Destroy();
                }
            }

            for (const [placementId, placedItem] of placedItems) {
                let itemModel = PLACED_ITEMS_FOLDER.FindFirstChild(placementId) as Model | undefined;
                if (!itemModel) {
                    const item = Items.getItem(placedItem.item);
                    if (item === undefined) {
                        continue;
                    }
                    const itemModel = item.createModel(placedItem);
                    if (!itemModel) {
                        continue;
                    }
                    itemModel.Name = placementId;
                    itemModel.Parent = PLACED_ITEMS_FOLDER;

                }
            }
        });
    }
}