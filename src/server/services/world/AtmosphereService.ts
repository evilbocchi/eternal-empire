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

import { setInstanceInfo, simpleInterval } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import { CollectionService, Lighting } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import eat from "shared/hamster/eat";
import Dropper from "shared/item/traits/dropper/Dropper";
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
export default class AtmosphereService implements OnInit, OnStart {
    /**
     * The current weather multipliers.
     */
    currentMultipliers = { dropRate: 1, dropletValue: 1 };

    /**
     * Current weather state.
     */
    currentWeather: WeatherState = {
        type: WeatherType.Clear,
        intensity: 0,
        duration: 300, // 5 minutes
        timeRemaining: 300,
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
     * Whether weather is manually controlled by commands.
     * When true, automatic weather generation is disabled.
     */
    isManuallyControlled = false;

    /**
     * Weather probabilities for each type.
     */
    private readonly WEATHER_PROBABILITIES = {
        [WeatherType.Clear]: 0.4,
        [WeatherType.Cloudy]: 0.3,
        [WeatherType.Rainy]: 0.2,
        [WeatherType.Thunderstorm]: 0.1,
    };

    constructor(private readonly dataService: DataService) {
        // Use current UTC time rounded to nearest hour for global sync
        const now = os.time();
        this.weatherSeed = math.floor(now / 3600) * 3600;
    }

    /**
     * Updates the weather system.
     *
     * @param dt Delta time since last update.
     */
    private updateWeather(dt: number) {
        this.currentWeather.timeRemaining -= dt;

        // Don't auto-generate weather if manually controlled
        if (this.currentWeather.timeRemaining <= 0 && !this.isManuallyControlled) {
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
            timeRemaining: duration,
        };

        print(`Weather changed to: ${weatherType} for ${duration} seconds`);

        // Notify clients of weather change
        Packets.weatherChanged.toAllClients(this.currentWeather);
    }

    /**
     * Applies current weather effects to the game world.
     */
    applyWeatherEffects() {
        switch (this.currentWeather.type) {
            case WeatherType.Thunderstorm:
                this.handleLightningStrikes();
                break;
        }

        this.currentMultipliers = this.getWeatherMultipliers();
        const weatherBoost: ItemBoost = {
            ignoresLimitations: false,
            dropRateMul: this.currentMultipliers.dropRate,
        };

        // Apply to all spawned drops
        for (const [, info] of Dropper.SPAWNED_DROPS) {
            if (info.Boosts) {
                info.Boosts.set("weather", weatherBoost);
            }
        }
    }

    /**
     * Handles lightning strikes during thunderstorms.
     */
    private handleLightningStrikes() {
        // Random chance for lightning strike every few seconds
        if (math.random() < 0.0005) {
            // 0.05% chance per physics step during thunderstorm
            this.triggerLightningStrike();
        }
    }

    /**
     * Triggers a lightning strike that can surge droplets.
     */
    private triggerLightningStrike() {
        // Find a random droplet to strike
        const children = CollectionService.GetTagged("Droplet");
        if (children.size() === 0) return;

        const randomDroplet = children[math.random(0, children.size() - 1)] as BasePart;
        if (!randomDroplet || !randomDroplet.IsA("BasePart")) return;

        // Apply lightning surge effect (10x value boost)
        this.surgeDroplet(randomDroplet);

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
        task.delay(2, () => {
            if (droplet && droplet.Parent) {
                setInstanceInfo(droplet, "LightningSurged", undefined);
            }
        });

        Packets.dropletSurged.toAllClients(droplet.Name);
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
     * Manually sets the weather to a specific type with default settings.
     * Enables manual control mode, disabling automatic weather generation.
     *
     * @param weatherType The type of weather to set.
     */
    public setWeatherManual(weatherType: WeatherType) {
        this.isManuallyControlled = true;
        this.setWeather(weatherType);
    }

    /**
     * Manually sets the weather with custom intensity and duration.
     * Enables manual control mode, disabling automatic weather generation.
     *
     * @param weatherType The type of weather to set.
     * @param intensity The intensity of the weather (0-1).
     * @param duration The duration in seconds.
     */
    public setWeatherCustom(weatherType: WeatherType, intensity: number, duration: number) {
        this.isManuallyControlled = true;

        // Clamp intensity between 0 and 1
        intensity = math.max(0, math.min(1, intensity));

        this.currentWeather = {
            type: weatherType,
            intensity,
            duration,
            timeRemaining: duration,
        };

        print(`Weather manually set to: ${weatherType} with intensity ${intensity} for ${duration} seconds`);

        // Notify clients of weather change
        Packets.weatherChanged.toAllClients(this.currentWeather);
    }

    /**
     * Stops manual weather control and resumes automatic weather generation.
     */
    public resumeAutomaticWeather() {
        this.isManuallyControlled = false;
        print("Automatic weather generation resumed");

        // Force immediate weather generation
        this.generateNextWeather();
    }

    /**
     * Clears current weather immediately and sets to clear.
     */
    public clearWeather() {
        this.isManuallyControlled = true;
        this.setWeather(WeatherType.Clear);
    }

    /**
     * Gets the weather multipliers for drop rates and droplet values.
     * @returns Object containing drop rate and value multipliers.
     */
    private getWeatherMultipliers() {
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
        Packets.getWeatherState.fromClient(() => this.getCurrentWeather());

        eat(() => {
            Lighting.ClockTime = 10.5; // Start at 10:30 AM
        });
    }

    onStart() {
        const dt = 0.2;
        const cleanup = simpleInterval(() => {
            Lighting.ClockTime += dt * 0.02;
            this.updateWeather(dt);
        }, dt);
        eat(cleanup);
    }
}
