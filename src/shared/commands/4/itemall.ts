import { Server } from "shared/api/APIExpose";
import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("ia")
    .setDescription("Give 99 of all items into the inventory and place 1 of each item. Should only be done in sandbox.")
    .setExecute(() => {
        for (const [id, item] of Server.Items.itemsPerId) {
            if (item.findTrait("Unique")) {
                CommandAPI.Item.giveItem(item, 1);
            } else {
                CommandAPI.Item.setBoughtAmount(item, 0);
                CommandAPI.Item.giveItem(item, 99);
            }

            const primaryPart = item.MODEL?.PrimaryPart;
            if (primaryPart === undefined) continue;

            CommandAPI.Item.serverPlace(id, primaryPart.Position, 0);
        }
    })
    .setPermissionLevel(4);
