import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("wauto")
    .addAlias("wrestart")
    .setDescription("Resume automatic weather generation after manual control")
    .setExecute((sender) => {
        const atmosphereService = CommandAPI.Atmosphere;
        if (atmosphereService && atmosphereService.resumeAutomaticWeather) {
            atmosphereService.resumeAutomaticWeather();
            CommandAPI.ChatHook.sendPrivateMessage(sender, "Automatic weather generation resumed", "color:138,255,138");
        } else {
            CommandAPI.ChatHook.sendPrivateMessage(sender, "Weather system not available", "color:255,43,43");
        }
    })
    .setPermissionLevel(3);
