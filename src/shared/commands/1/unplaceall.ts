import Command, { CommandAPI } from "shared/commands/Command";
import ThisEmpire from "shared/data/ThisEmpire";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import { AREAS } from "shared/world/Area";

export = new Command(script.Name)
    .addAlias("ua")
    .setDescription("Unplace all items in the area you are currently in.")
    .setExecute((o) => {
        const placedItems = ThisEmpire.data.items.worldPlaced;
        const toRemove = new Set<string>();
        const area = Sandbox.getEnabled() ? undefined : Packets.currentArea.get(o);
        for (const [id, placedItem] of placedItems)
            if (area === undefined || placedItem.area === area) toRemove.add(id);

        CommandAPI.Item.unplaceItems(o, toRemove);
        CommandAPI.ChatHook.sendPrivateMessage(
            o,
            `Unplaced all items in ${area === undefined ? "all" : AREAS[area].name}`,
            "color:138,255,138",
        );
    })
    .setPermissionLevel(1);
