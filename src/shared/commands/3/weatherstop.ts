import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("wstop")
    .addAlias("wclear")
    .setDescription("Stop current weather and set to clear immediately")
    .setExecute((sender) => {
        const atmosphereService = Server.Atmosphere;
        if (atmosphereService && atmosphereService.clearWeather) {
            atmosphereService.clearWeather();
            Server.ChatHook.sendPrivateMessage(sender, "Weather cleared", "color:138,255,138");
        } else {
            Server.ChatHook.sendPrivateMessage(sender, "Weather system not available", "color:255,43,43");
        }
    })
    .setPermissionLevel(3);
