import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("winfo")
    .addAlias("wstatus")
    .setDescription("Display current weather information")
    .setExecute((sender) => {
        const atmosphereService = Server.Atmosphere;
        if (atmosphereService && atmosphereService.getCurrentWeather) {
            const weather = atmosphereService.getCurrentWeather();
            const minutes = math.floor(weather.timeRemaining / 60);
            const seconds = math.floor(weather.timeRemaining % 60);
            const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

            Server.ChatHook.sendPrivateMessage(sender, "=== WEATHER STATUS ===", "color:255,255,255");
            Server.ChatHook.sendPrivateMessage(sender, `Type: ${weather.type}`, "color:200,200,200");
            Server.ChatHook.sendPrivateMessage(sender, `Intensity: ${weather.intensity}`, "color:200,200,200");
            Server.ChatHook.sendPrivateMessage(sender, `Time Remaining: ${timeStr}`, "color:200,200,200");
            Server.ChatHook.sendPrivateMessage(sender, `Duration: ${weather.duration}s`, "color:200,200,200");
        } else {
            Server.ChatHook.sendPrivateMessage(sender, "Weather system not available", "color:255,43,43");
        }
    })
    .setPermissionLevel(3);
