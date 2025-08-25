//!native
//!optimize 2

/**
 * @fileoverview Handles environmental effects such as lighting and weather.
 *
 * This service is responsible for:
 * - Progressing the in-game time by updating Lighting.ClockTime
 * - Managing global weather states (clear, cloudy, rainy, thunderstorm)
 * - Applying weather effects to droppers and droplets
 * - Synchronizing weather across all servers using deterministic timing
 *
 * @since 1.0.0
 */

import { setInstanceInfo } from "@antivivi/vrldk";
import { OnInit, OnPhysics, Service } from "@flamework/core";
import { Lighting, TweenService, Workspace } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import { getSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";
import { WeatherState, WeatherType } from "shared/weather/WeatherTypes";

declare global {
    interface InstanceInfo {
        LightningSurged?: boolean;
    }
}

/**
 * Service that manages atmospheric effects and weather.
 */
@Service()
export default class AtmosphereService implements OnInit, OnPhysics {

    /**
     * Current weather state.
     */
    currentWeather: WeatherState = {
        type: WeatherType.Clear,
        intensity: 0,
        duration: 300, // 5 minutes
        timeRemaining: 300
    };

    /**
     * Deterministic seed for weather generation.
     * Based on server start time to ensure global consistency.
     */
    private readonly weatherSeed: number;

    /**
     * Weather cycle duration in seconds.
     * Each full cycle lasts 20 minutes.
     */
    private readonly WEATHER_CYCLE_DURATION = 1200;

    /**
     * Weather probabilities for each type.
     */
    private readonly WEATHER_PROBABILITIES = {
        [WeatherType.Clear]: 0.4,
        [WeatherType.Cloudy]: 0.3,
        [WeatherType.Rainy]: 0.2,
        [WeatherType.Thunderstorm]: 0.1
    };

    constructor(private readonly dataService: DataService) {
        // Use current UTC time rounded to nearest hour for global sync
        const now = os.time();
        this.weatherSeed = math.floor(now / 3600) * 3600;
    }

    /**
     * Advances the in-game clock time and updates weather system.
     * Called every physics update.
     *
     * @param dt Delta time since last update.
     */
    onPhysics(dt: number) {
        Lighting.ClockTime += dt * 0.02;
        this.updateWeather(dt);
    }

    /**
     * Updates the weather system.
     * 
     * @param dt Delta time since last update.
     */
    private updateWeather(dt: number) {
        this.currentWeather.timeRemaining -= dt;

        if (this.currentWeather.timeRemaining <= 0) {
            this.generateNextWeather();
        }

        this.applyWeatherEffects();
    }

    /**
     * Generates the next weather state using deterministic algorithm.
     */
    private generateNextWeather() {
        // Don't generate weather changes during the first 20 minutes of playtime
        if (this.dataService.empireData.playtime < 1200) {
            this.setWeather(WeatherType.Clear);
            return;
        }

        const currentTime = os.time();
        const cyclePosition = (currentTime - this.weatherSeed) % this.WEATHER_CYCLE_DURATION;

        // Use seeded random for deterministic weather
        const seed = this.weatherSeed + math.floor(cyclePosition / 300); // New weather every 5 minutes
        const random = new Random(seed);

        const roll = random.NextNumber();
        let cumulativeProbability = 0;

        for (const [weatherType, probability] of pairs(this.WEATHER_PROBABILITIES)) {
            cumulativeProbability += probability;
            if (roll <= cumulativeProbability) {
                this.setWeather(weatherType);
                break;
            }
        }
    }

    /**
     * Sets the current weather state.
     * 
     * @param weatherType The type of weather to set.
     */
    private setWeather(weatherType: WeatherType) {
        let duration = 300; // 5 minutes default
        let intensity = 1;

        // Adjust duration and intensity based on weather type
        switch (weatherType) {
            case WeatherType.Clear:
                duration = 400; // Longer clear periods
                intensity = 0;
                break;
            case WeatherType.Cloudy:
                duration = 300;
                intensity = 0.6;
                break;
            case WeatherType.Rainy:
                duration = 240; // Shorter rain periods
                intensity = 0.8;
                break;
            case WeatherType.Thunderstorm:
                duration = 180; // Short but intense
                intensity = 1;
                break;
        }

        this.currentWeather = {
            type: weatherType,
            intensity,
            duration,
            timeRemaining: duration
        };

        print(`Weather changed to: ${weatherType} for ${duration} seconds`);

        // Notify clients of weather change
        Packets.weatherChanged.fireAll(this.currentWeather);
    }

    /**
     * Applies current weather effects to the game world.
     */
    private applyWeatherEffects() {
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
     * Applies clear weather effects.
     */
    private applyClearWeather() {
        // Clear weather - no special effects needed
        // Lighting and atmosphere return to normal
    }

    /**
     * Applies cloudy weather effects.
     */
    private applyCloudyWeather() {
        // Cloudy weather reduces drop rates to 0.75x
        // This will be handled by the weather boost system
    }

    /**
     * Applies rainy weather effects.
     */
    private applyRainyWeather() {
        // Rainy weather:
        // - Reduces drop rates to 0.5x 
        // - Increases droplet values by 2.5x
        // - Shows rain visual effects
        // This will be handled by the weather boost system and visual effects
    }

    /**
     * Applies thunderstorm weather effects.
     */
    private applyThunderstormWeather() {
        // Thunderstorm weather:
        // - Same effects as rain
        // - Lightning strikes that surge droplets (10x value boost)
        // - Thunder sound effects
        this.handleLightningStrikes();
    }

    /**
     * Handles lightning strikes during thunderstorms.
     */
    private handleLightningStrikes() {
        // Random chance for lightning strike every few seconds
        if (math.random() < 0.0005) { // 0.05% chance per physics step during thunderstorm
            this.triggerLightningStrike();
        }
    }

    /**
     * Triggers a lightning strike that can surge droplets.
     */
    private triggerLightningStrike() {
        // Find a random droplet to strike
        const droplets = Workspace.FindFirstChild("Droplets") as Model | undefined;
        if (!droplets) return;

        const children = droplets.GetChildren();
        if (children.size() === 0) return;

        const randomDroplet = children[math.random(0, children.size() - 1)] as BasePart;
        if (!randomDroplet || !randomDroplet.IsA("BasePart")) return;

        // Apply lightning surge effect (10x value boost)
        this.surgeDroplet(randomDroplet);

        // Visual and audio effects
        this.createLightningEffects(randomDroplet.Position);

        print(`Lightning struck droplet at position: ${randomDroplet.Position}`);
    }

    /**
     * Applies a surge effect to a droplet, boosting its value by 10x.
     * 
     * @param droplet The droplet to surge.
     */
    private surgeDroplet(droplet: BasePart) {
        // Add a surge attribute that can be read by the value calculation system
        setInstanceInfo(droplet, "LightningSurged", true);

        // Visual effect for surged droplet
        const light = new Instance("PointLight");
        light.Color = Color3.fromRGB(255, 255, 255);
        light.Brightness = 10;
        light.Range = 3;
        light.Parent = droplet;

        // Fade back to original color over time
        TweenService.Create(light, new TweenInfo(2), { Brightness: 0 }).Play();
        task.delay(2, () => {
            setInstanceInfo(droplet, "LightningSurged", false);
        });
    }

    /**
     * Creates visual and audio effects for lightning strikes.
     * 
     * @param position The position where lightning struck.
     */
    private createLightningEffects(position: Vector3) {
        // Create lightning bolt effect
        const lightning = new Instance("Part");
        lightning.Name = "Lightning";
        lightning.Size = new Vector3(0.5, 100, 0.5);
        lightning.Material = Enum.Material.Neon;
        lightning.Color = Color3.fromRGB(255, 255, 255);
        lightning.Anchored = true;
        lightning.CanCollide = false;
        lightning.CFrame = new CFrame(position.add(new Vector3(0, 50, 0)));
        lightning.Parent = Workspace;

        // Lightning flash effect
        const flash = new Instance("PointLight");
        flash.Color = Color3.fromRGB(200, 200, 255);
        flash.Brightness = 10;
        flash.Range = 100;
        flash.Parent = lightning;

        // Remove effects after short duration
        task.spawn(() => {
            task.wait(0.05);
            lightning.Destroy();
        });

        // Thunder sound effect
        try {
            const thunderSound = getSound("Thunder.mp3");
            if (thunderSound) {
                thunderSound.Volume = 0.5;
                thunderSound.Play();
            }
        } catch (error) {
            print("Could not play thunder sound:", error);
        }

        print("⚡ THUNDER! ⚡");
    }

    /**
     * Gets the current weather state.
     * 
     * @returns The current weather state.
     */
    getCurrentWeather(): WeatherState {
        return this.currentWeather;
    }

    /**
     * Gets the weather multipliers for drop rates and droplet values.
     * 
     * @returns Object containing drop rate and value multipliers.
     */
    getWeatherMultipliers() {
        switch (this.currentWeather.type) {
            case WeatherType.Clear:
                return { dropRate: 1, dropletValue: 1 };
            case WeatherType.Cloudy:
                return { dropRate: 0.75, dropletValue: 1 };
            case WeatherType.Rainy:
                return { dropRate: 0.5, dropletValue: 2.5 };
            case WeatherType.Thunderstorm:
                return { dropRate: 0.5, dropletValue: 2.5 };
            default:
                return { dropRate: 1, dropletValue: 1 };
        }
    }

    onInit() {
        // Initialize weather system
        this.generateNextWeather();

        // Set up packet handlers for weather state requests
        Packets.getWeatherState.onInvoke(() => this.getCurrentWeather());
    }
}