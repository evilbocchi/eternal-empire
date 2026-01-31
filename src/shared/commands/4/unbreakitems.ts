import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("repairallitems")
    .setDescription("Restore every broken placed item to working order.")
    .setPermissionLevel(4)
    .setExecute((sender) => {
        const restored = Server.Item.repairAllBrokenItems();

        Server.ChatHook.sendPrivateMessage(
            sender,
            `Restored ${restored} broken item${restored === 1 ? "" : "s"}.`,
            "color:120,255,180",
        );
    });
