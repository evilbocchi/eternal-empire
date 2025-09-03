import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("g")
    .setDescription("Toggle on/off global chat.")
    .setExecute(() => {
        const empireData = CommandAPI.Data.empireData;
        const newSetting = !empireData.globalChat;
        empireData.globalChat = newSetting;
        CommandAPI.ChatHook.sendServerMessage(`Global chat has been turned ${newSetting === true ? "on" : "off"}`);
    })
    .setPermissionLevel(2);
