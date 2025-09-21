import Command, { CommandAPI } from "shared/commands/Command";
import { AREAS } from "shared/world/Area";
import Sandbox from "shared/Sandbox";

export = new Command(script.Name)
    .addAlias("ua")
    .setDescription("Unplace all items in the area you are currently in.")
    .setExecute((o) => {
        const placedItems = CommandAPI.Data.empireData.items.worldPlaced;
        const toRemove = new Array<string>();
        const area = Sandbox.getEnabled() ? undefined : (o.GetAttribute("Area") as AreaId | undefined);
        for (const [id, placedItem] of placedItems)
            if (area === undefined || placedItem.area === area) toRemove.push(id);

        CommandAPI.Item.unplaceItems(o, toRemove);
        CommandAPI.ChatHook.sendPrivateMessage(
            o,
            `Unplaced all items in ${area === undefined ? "all" : AREAS[area].name}`,
            "color:138,255,138",
        );
    })
    .setPermissionLevel(1);
