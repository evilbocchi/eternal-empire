import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("wstop")
    .addAlias("wclear")
    .setDescription("Stop current weather and set to clear immediately")
    .setExecute((sender) => {
        const atmosphereService = CommandAPI.Atmosphere as {
            clearWeather: () => void;
        };

        if (atmosphereService && atmosphereService.clearWeather) {
            atmosphereService.clearWeather();
            CommandAPI.ChatHook.sendPrivateMessage(sender, "Weather cleared", "color:138,255,138");
        } else {
            CommandAPI.ChatHook.sendPrivateMessage(sender, "Weather system not available", "color:255,43,43");
        }
    })
    .setPermissionLevel(3);
