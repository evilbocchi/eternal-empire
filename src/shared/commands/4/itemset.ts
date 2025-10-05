import { ITEM_PER_ID } from "shared/api/APIExpose";
import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("iset")
    .setDescription(
        "<item> <amount> : Set the quantity for an item. If item is 'all', sets all items. If item is a unique item, gives the specified amount.",
    )
    .setExecute((_o, item, amount) => {
        const a = tonumber(amount) ?? 0;
        const giveItem = (id: string) => {
            const item = ITEM_PER_ID.get(id);
            if (!item) {
                warn(`Item with id ${id} does not exist.`);
                return;
            }
            if (item.findTrait("Unique")) {
                CommandAPI.Item.giveItem(id, a);
            } else {
                CommandAPI.Item.setItemAmount(id, a);
                CommandAPI.Item.setBoughtAmount(id, a);
            }
        };
        if (item === "all") {
            for (const [id, _] of ITEM_PER_ID) {
                giveItem(id);
            }
            return;
        }
        giveItem(item);
    })
    .setPermissionLevel(4);
