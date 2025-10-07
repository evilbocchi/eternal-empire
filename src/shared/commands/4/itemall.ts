import { ITEM_PER_ID } from "shared/api/APIExpose";
import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("ia")
    .setDescription("Give 99 of all items into the inventory and place 1 of each item. Should only be done in sandbox.")
    .setExecute(() => {
        for (const [id, item] of ITEM_PER_ID) {
            if (item.findTrait("Unique")) {
                CommandAPI.Item.giveItem(id, 1);
            } else {
                CommandAPI.Item.setBoughtAmount(id, 0);
                CommandAPI.Item.setItemAmount(id, 99);
            }

            const primaryPart = item.MODEL?.PrimaryPart;
            if (primaryPart === undefined) continue;

            CommandAPI.Item.serverPlace(id, primaryPart.Position, 0);
        }
    })
    .setPermissionLevel(4);
