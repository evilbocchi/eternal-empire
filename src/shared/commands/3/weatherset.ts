import Command, { CommandAPI } from "shared/commands/Command";
import { WeatherType } from "shared/weather/WeatherTypes";

export = new Command(script.Name)
    .addAlias("wset")
    .setDescription("<type> <intensity> <duration> : Set weather with custom intensity (0-1) and duration (seconds)")
    .setExecute((sender, weatherTypeStr, intensityStr, durationStr) => {
        if (!weatherTypeStr || !intensityStr || !durationStr) {
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                "Usage: /weatherset <type> <intensity> <duration>",
                "color:255,200,100",
            );
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                "Weather types: clear, cloudy, rainy, thunderstorm",
                "color:200,200,200",
            );
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                "Intensity: 0.0-1.0 (0 = no effect, 1 = maximum effect)",
                "color:200,200,200",
            );
            CommandAPI.ChatHook.sendPrivateMessage(sender, "Duration: time in seconds", "color:200,200,200");
            return;
        }

        const weatherType = weatherTypeStr.lower();
        let targetWeather: WeatherType | undefined;

        switch (weatherType) {
            case "clear":
                targetWeather = WeatherType.Clear;
                break;
            case "cloudy":
                targetWeather = WeatherType.Cloudy;
                break;
            case "rainy":
            case "rain":
                targetWeather = WeatherType.Rainy;
                break;
            case "thunderstorm":
            case "thunder":
            case "storm":
                targetWeather = WeatherType.Thunderstorm;
                break;
            default:
                CommandAPI.ChatHook.sendPrivateMessage(
                    sender,
                    `Invalid weather type: ${weatherTypeStr}. Options: clear, cloudy, rainy, thunderstorm`,
                    "color:255,43,43",
                );
                return;
        }

        const intensity = tonumber(intensityStr);
        const duration = tonumber(durationStr);

        if (intensity === undefined || intensity < 0 || intensity > 1) {
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                "Intensity must be a number between 0.0 and 1.0",
                "color:255,43,43",
            );
            return;
        }

        if (duration === undefined || duration <= 0) {
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                "Duration must be a positive number (seconds)",
                "color:255,43,43",
            );
            return;
        }

        const atmosphereService = CommandAPI.Atmosphere;

        if (atmosphereService && atmosphereService.setWeatherCustom) {
            atmosphereService.setWeatherCustom(targetWeather, intensity, duration);
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                `Weather set to: ${targetWeather} (intensity: ${intensity}, duration: ${duration}s)`,
                "color:138,255,138",
            );
        } else {
            CommandAPI.ChatHook.sendPrivateMessage(sender, "Weather system not available", "color:255,43,43");
        }
    })
    .setPermissionLevel(3);
