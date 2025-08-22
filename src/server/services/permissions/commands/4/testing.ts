import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command("testing")
    .addAlias("test")
    .setDescription("Enable/disable testing mode.")
    .setExecute(() => {
        const newSetting = !CommandAPI.Data.testing;
        CommandAPI.Data.testing = newSetting;
        CommandAPI.ChatHook.sendServerMessage(`Testing mode has been turned ${newSetting === true ? "on" : "off"}`);
    })
    .setPermissionLevel(4);