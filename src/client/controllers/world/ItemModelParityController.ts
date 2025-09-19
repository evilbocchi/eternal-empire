import { Controller, OnStart } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

@Controller()
export default class ItemModelParityController implements OnStart {
    /**
     * Loads item effects for a given model instance.
     * @param model The item model instance.
     */
    load(model: Instance) {
        if (!model.IsA("Model") || model.GetAttribute("Selected") === true || model.GetAttribute("applied") === true) {
            return;
        }
        const itemId = model.GetAttribute("ItemId") as string | undefined;
        if (itemId === undefined) {
            return;
        }
        const item = Items.getItem(itemId);
        if (item === undefined) {
            return;
        }
        model.SetAttribute("applied", true);
        task.spawn(() => item.CLIENT_LOADS.forEach((callback) => callback(model, item, LOCAL_PLAYER)));
    }

    onStart() {
        task.spawn(() => {
            while (task.wait(2)) {
                for (const child of PLACED_ITEMS_FOLDER.GetChildren()) {
                    this.load(child);
                }
            }
        });
        PLACED_ITEMS_FOLDER.ChildAdded.Connect((child) => this.load(child));
        for (const item of PLACED_ITEMS_FOLDER.GetChildren()) {
            this.load(item);
        }
        if (PLACED_ITEMS_FOLDER.Parent === Workspace) return;

        Packets.placedItems.observe((placedItems) => {
            for (const child of PLACED_ITEMS_FOLDER.GetChildren()) {
                if (!placedItems.has(child.Name) && !child.HasTag("Placing")) {
                    child.Destroy();
                }
            }

            for (const [placementId, placedItem] of placedItems) {
                const itemModel = PLACED_ITEMS_FOLDER.FindFirstChild(placementId) as Model | undefined;
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
