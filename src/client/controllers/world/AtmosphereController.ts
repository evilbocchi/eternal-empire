/**
 * @fileoverview Client controller for managing area lighting and atmosphere effects.
 *
 * Handles:
 * - Tracking and updating light sources in each area
 * - Adjusting light brightness and shadows based on quality settings and time of day
 * - Managing weather visual effects (rain, clouds, lightning)
 * - Integrating with area data and user game settings
 *
 * The controller manages dynamic lighting and atmosphere effects to enhance the visual experience in different areas.
 *
 * @since 1.0.0
 */
import { Controller, OnInit, OnStart } from "@flamework/core";
import { Lighting, Workspace } from "@rbxts/services";
import { AREAS } from "shared/Area";
import ItemUtils from "shared/item/ItemUtils";
import Packets from "shared/Packets";
import { WeatherState, WeatherType } from "shared/weather/WeatherTypes";

/**
 * Controller responsible for managing area lighting and atmosphere effects.
 *
 * Tracks light sources, updates brightness and shadows based on quality settings and time of day,
 * and manages weather visual effects.
 */
@Controller()
export default class AtmosphereController implements OnInit, OnStart {

    /** Map of Light instances to their base brightness. */
    lights = new Map<Light, number>();

    rainy = false;

    /** Current weather state. */
    private currentWeather: WeatherState = { type: WeatherType.Clear, intensity: 0, duration: 300, timeRemaining: 300 };

    /**
     * Finds a Light instance within a given container.
     * @param lightSourceContainer The container to search for a Light.
     * @returns The found Light instance, or undefined.
     */
    findLight(lightSourceContainer: Instance) {
        const light = lightSourceContainer.FindFirstChildOfClass("Light");
        if (light !== undefined) {
            return light;
        }

        return lightSourceContainer.FindFirstChild("LightSource")?.FindFirstChildWhichIsA("Light");
    }

    /**
     * Initializes the AtmosphereController, collects lights from all areas.
     */
    onInit() {
        for (const [_id, area] of pairs(AREAS)) {
            const lights = area.map.FindFirstChild("Lights");
            if (lights !== undefined) {
                const children = lights.GetChildren();
                for (const child of children) {
                    const light = this.findLight(child);
                    if (light !== undefined)
                        this.lights.set(light, light.Brightness);
                }
            }
        }

        // Set up weather packet listeners
        Packets.weatherChanged.connect((weatherState: object) => {
            this.currentWeather = weatherState as WeatherState;
            this.updateWeatherEffects();
        });

        // Request current weather state
        task.spawn(() => {
            const weatherState = Packets.getWeatherState.invoke() as WeatherState;
            this.currentWeather = weatherState;
            this.updateWeatherEffects();
        });
    }

    /**
     * Starts the AtmosphereController, updates light brightness and shadows based on quality and time of day.
     */
    onStart() {
        const UserGameSettings = ItemUtils.UserGameSettings!;
        let oldQualityLevel = UserGameSettings.SavedQualityLevel.Value;
        task.spawn(() => {
            while (true) {
                const qualityLevel = UserGameSettings.SavedQualityLevel.Value;
                task.wait(qualityLevel >= 5 ? 1 / 60 : 1);

                for (const [light, base] of this.lights) {
                    if (oldQualityLevel !== qualityLevel) {
                        light.Shadows = qualityLevel === 10;
                    }
                    let brightness = qualityLevel === 1 ? 0 : (math.abs(Lighting.ClockTime - 12) / 8 - 0.25) * base * 2;

                    // Apply weather dimming effects
                    if (this.currentWeather.type === WeatherType.Cloudy) {
                        brightness *= 0.8; // Slightly dimmer for cloudy weather
                    } else if (this.currentWeather.type === WeatherType.Rainy || this.currentWeather.type === WeatherType.Thunderstorm) {
                        brightness *= 0.6; // Much dimmer for rain/thunderstorm
                    }

                    light.Brightness = brightness;
                }
                oldQualityLevel = qualityLevel;
            }
        });
    }

    /**
     * Updates weather visual effects based on current weather state.
     */
    private updateWeatherEffects() {
        this.clearWeatherEffects();

        switch (this.currentWeather.type) {
            case WeatherType.Clear:
                this.applyClearWeather();
                break;
            case WeatherType.Cloudy:
                this.applyCloudyWeather();
                break;
            case WeatherType.Rainy:
                this.applyRainyWeather();
                break;
            case WeatherType.Thunderstorm:
                this.applyThunderstormWeather();
                break;
        }
    }

    /**
     * Clears all weather effects.
     */
    private clearWeatherEffects() {
        // Reset atmospheric properties
        Lighting.Brightness = 2;
        Lighting.OutdoorAmbient = Color3.fromRGB(128, 128, 128);
        Lighting.FogEnd = 100000;

        this.rainy = false;
    }

    /**
     * Applies clear weather effects.
     */
    private applyClearWeather() {
        Lighting.Brightness = 2;
        Lighting.OutdoorAmbient = Color3.fromRGB(128, 128, 128);
        Lighting.FogEnd = 100000;

        this.rainy = false;
    }

    /**
     * Applies cloudy weather effects.
     */
    private applyCloudyWeather() {
        Lighting.Brightness = 1.5;
        Lighting.OutdoorAmbient = Color3.fromRGB(100, 100, 120);
        Lighting.FogEnd = 50000;

        this.rainy = false;
    }

    /**
     * Applies rainy weather effects.
     */
    private applyRainyWeather() {
        Lighting.Brightness = 1;
        Lighting.OutdoorAmbient = Color3.fromRGB(80, 80, 100);
        Lighting.FogEnd = 20000;

        this.rainy = true;
    }

    /**
     * Applies thunderstorm weather effects.
     */
    private applyThunderstormWeather() {
        Lighting.Brightness = 0.8;
        Lighting.OutdoorAmbient = Color3.fromRGB(60, 60, 80);
        Lighting.FogEnd = 15000;

        this.rainy = true;
    }

    private rainDrop() {
        // TODO
    }
}