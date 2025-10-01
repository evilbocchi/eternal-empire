import Command, { CommandAPI } from "shared/commands/Command";
import { WeatherType } from "shared/weather/WeatherTypes";

export = new Command(script.Name)
    .addAlias("w")
    .setDescription("<type> : Set weather type. Options: clear, cloudy, rainy, thunderstorm")
    .setExecute((sender, weatherTypeStr) => {
        if (!weatherTypeStr) {
            CommandAPI.ChatHook.sendPrivateMessage(
                sender,
                "Usage: /weather <type> - Options: clear, cloudy, rainy, thunderstorm",
                "color:255,200,100",
            );
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

        const atmosphereService = CommandAPI.Atmosphere;
        if (atmosphereService && atmosphereService.setWeatherManual) {
            atmosphereService.setWeatherManual(targetWeather);
            CommandAPI.ChatHook.sendPrivateMessage(sender, `Weather set to: ${targetWeather}`, "color:138,255,138");
        } else {
            CommandAPI.ChatHook.sendPrivateMessage(sender, "Weather system not available", "color:255,43,43");
        }
    })
    .setPermissionLevel(3);
