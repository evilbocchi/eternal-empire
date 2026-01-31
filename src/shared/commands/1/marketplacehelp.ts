import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("mphelp")
    .setDescription("Display marketplace help information.")
    .setExecute((o) => {
        Server.ChatHook.sendPrivateMessage(o, "=== MARKETPLACE COMMANDS ===", "color:255,255,255");
        Server.ChatHook.sendPrivateMessage(o, "/marketplacetoggle - Enable/disable marketplace", "color:200,200,200");
        Server.ChatHook.sendPrivateMessage(o, "/marketplacestats - View marketplace statistics", "color:200,200,200");
        Server.ChatHook.sendPrivateMessage(
            o,
            "/settradewebhook <url> - Set trade recovery webhook",
            "color:200,200,200",
        );
        Server.ChatHook.sendPrivateMessage(o, "/testmarketplace - Test marketplace functionality", "color:200,200,200");
        Server.ChatHook.sendPrivateMessage(o, "Players can press 'M' to open the marketplace UI", "color:200,200,200");
    })
    .setPermissionLevel(1);
