import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("iset")
    .setDescription(
        "<item> <amount> : Set the quantity for an item. If item is 'all', sets all items. If item is a unique item, gives the specified amount.",
    )
    .setExecute((_o, itemId, inputAmount) => {
        const amount = tonumber(inputAmount) ?? 0;
        const giveItem = (id: string) => {
            const item = Server.Items.itemsPerId.get(id);
            if (!item) {
                warn(`Item with id ${id} does not exist.`);
                return;
            }
            if (item.findTrait("Unique")) {
                Server.Item.giveItem(item, amount);
            } else {
                Server.empireData.items.inventory.set(id, amount);
                Server.empireData.items.bought.set(id, amount);
                Server.Item.requestChanges();
            }
        };
        if (itemId === "all") {
            for (const [id, _] of Server.Items.itemsPerId) {
                giveItem(id);
            }
            return;
        }
        giveItem(itemId);
    })
    .setPermissionLevel(4);
