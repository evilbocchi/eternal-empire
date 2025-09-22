import Command, { CommandAPI } from "shared/commands/Command";
import ThisEmpire from "shared/data/ThisEmpire";

export = new Command(script.Name)
    .addAlias("g")
    .setDescription("Toggle on/off global chat.")
    .setExecute(() => {
        const empireData = ThisEmpire.data;
        const newSetting = !empireData.globalChat;
        empireData.globalChat = newSetting;
        CommandAPI.ChatHook.sendServerMessage(`Global chat has been turned ${newSetting === true ? "on" : "off"}`);
    })
    .setPermissionLevel(2);
