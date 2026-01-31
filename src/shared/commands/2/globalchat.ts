import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("g")
    .setDescription("Toggle on/off global chat.")
    .setExecute(() => {
        const empireData = Server.empireData;
        const newSetting = !empireData.globalChat;
        empireData.globalChat = newSetting;
        Server.ChatHook.sendServerMessage(`Global chat has been turned ${newSetting === true ? "on" : "off"}`);
    })
    .setPermissionLevel(2);
