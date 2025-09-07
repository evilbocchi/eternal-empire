import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("tglp")
    .setDescription("Toggle particles emitted by newly placed items on or off.")
    .setExecute(() => {
        const empireData = CommandAPI.Data.empireData;
        const newSetting = !empireData.particlesEnabled;
        empireData.particlesEnabled = newSetting;
        CommandAPI.Item.refreshEffects();
        CommandAPI.ChatHook.sendServerMessage(
            `Particles for newly placed items have been ${newSetting === true ? "enabled" : "disabled"}`,
        );
    })
    .setPermissionLevel(2);
