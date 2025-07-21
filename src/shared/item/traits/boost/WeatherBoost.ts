import { getAllInstanceInfo } from "@antivivi/vrldk";
import { RunService } from "@rbxts/services";
import AtmosphereService from "server/services/world/AtmosphereService";
import { Server } from "shared/item/ItemUtils";
import Droplet from "shared/item/Droplet";
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
    static updateWeatherMultipliers(multipliers: { dropRate: number, dropletValue: number }) {
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
            weatherValueMultiplier: this.currentMultipliers.dropletValue
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
        
        // Check for lightning surge effect
        const isLightningSurged = droplet.GetAttribute("LightningSurged") as boolean;
        const surgeMultiplier = droplet.GetAttribute("SurgeMultiplier") as number;
        
        if (isLightningSurged && surgeMultiplier) {
            multiplier *= surgeMultiplier;
        }
        
        return multiplier;
    }
    
    /**
     * Initializes the weather boost system.
     */
    static initialize() {
        // Update weather multipliers every second
        task.spawn(() => {
            while (task.wait(1)) {
                if (Server.Atmosphere) {
                    const multipliers = Server.Atmosphere.getWeatherMultipliers();
                    this.updateWeatherMultipliers(multipliers);
                }
            }
        });
        
        print("Weather boost system initialized");
    }
}