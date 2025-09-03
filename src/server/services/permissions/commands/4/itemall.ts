import Command, { CommandAPI } from "server/services/permissions/commands/Command";
import Items from "shared/items/Items";

export = new Command(script.Name)
    .addAlias("ia")
    .setDescription("Give 99 of all items into the inventory and place 1 of each item. Should only be done in sandbox.")
    .setExecute(() => {
        for (const [id, item] of Items.itemsPerId) {
            CommandAPI.Item.setBoughtAmount(id, 0);
            CommandAPI.Item.setItemAmount(id, 99);

            const primaryPart = item.MODEL?.PrimaryPart;
            if (primaryPart === undefined) continue;

            CommandAPI.Item.serverPlace(id, primaryPart.Position, 0);
        }
    })
    .setPermissionLevel(4);
