import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import { AREAS } from "shared/world/Area";

export = new Command(script.Name)
    .addAlias("ua")
    .setDescription("Unplace all items in the area you are currently in.")
    .setExecute((sender) => {
        const area = Sandbox.getEnabled() ? undefined : Packets.currentArea.get(sender);
        Server.Item.unplaceItemsInArea(sender, area);
        Server.ChatHook.sendPrivateMessage(
            sender,
            `Unplaced all items in ${area === undefined ? "all" : AREAS[area].name}`,
            "color:138,255,138",
        );
    })
    .setPermissionLevel(1);
