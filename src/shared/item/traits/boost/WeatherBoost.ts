import { getInstanceInfo, simpleInterval } from "@antivivi/vrldk";
import { Server } from "shared/api/APIExpose";
import eat from "shared/hamster/eat";
import Dropper from "shared/item/traits/dropper/Dropper";

declare global {
    interface ItemBoost {
        weatherDropRateMultiplier?: number;
        weatherValueMultiplier?: number;
    }
}

/**
 * Weather boost system that applies weather effects to droppers and droplets.
 * This is a static class that automatically applies weather multipliers to all droppers.
 */
export default class WeatherBoost {
    /**
     * The current weather multipliers.
     */
    private static currentMultipliers = { dropRate: 1, dropletValue: 1 };

    /**
     * Updates weather multipliers and applies them to all active droppers.
     *
     * @param multipliers The new weather multipliers to apply.
     */
    static updateWeatherMultipliers(multipliers: { dropRate: number; dropletValue: number }) {
        this.currentMultipliers = multipliers;
        this.applyMultipliersToDroppers();
    }

    /**
     * Applies current weather multipliers to all active droppers.
     */
    private static applyMultipliersToDroppers() {
        const weatherBoost: ItemBoost = {
            placementId: "weather-system",
            ignoresLimitations: false,
            dropRateMultiplier: this.currentMultipliers.dropRate,
            weatherDropRateMultiplier: this.currentMultipliers.dropRate,
            weatherValueMultiplier: this.currentMultipliers.dropletValue,
        };

        // Apply to all spawned drops
        for (const [drop, info] of Dropper.SPAWNED_DROPS) {
            if (info.Boosts) {
                info.Boosts.set("weather", weatherBoost);
            }
        }
    }

    /**
     * Gets the weather value multiplier for a droplet, including lightning surge effects.
     *
     * @param droplet The droplet to check for weather effects.
     * @returns The total value multiplier to apply.
     */
    static getDropletValueMultiplier(droplet: BasePart): number {
        let multiplier = this.currentMultipliers.dropletValue;

        if (getInstanceInfo(droplet, "LightningSurged")) {
            multiplier *= 10;
        }

        return multiplier;
    }

    /**
     * Initializes the weather boost system.
     */
    static initialize() {
        // Update weather multipliers every second
        const cleanup = simpleInterval(() => {
            if (Server.Atmosphere) {
                const multipliers = Server.Atmosphere.getWeatherMultipliers();
                this.updateWeatherMultipliers(multipliers);
            }
        }, 1);
        eat(cleanup);

        print("Weather boost system initialized");
    }
}
