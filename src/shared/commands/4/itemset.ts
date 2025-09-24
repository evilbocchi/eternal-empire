import Command, { CommandAPI } from "shared/commands/Command";
import Items from "shared/items/Items";

export = new Command(script.Name)
    .addAlias("iset")
    .setDescription("<item> <amount> : Set the quantity for an item.")
    .setExecute((_o, item, amount) => {
        const a = tonumber(amount) ?? 0;
        const giveItem = (id: string) => {
            if (!Items.itemsPerId.has(id)) {
                warn(`Item with id ${id} does not exist.`);
                return;
            }
            CommandAPI.Item.setItemAmount(id, a);
            CommandAPI.Item.setBoughtAmount(id, a);
        };
        if (item === "all") {
            for (const [id, _] of Items.itemsPerId) {
                giveItem(id);
            }
            return;
        }
        giveItem(item);
    })
    .setPermissionLevel(4);
