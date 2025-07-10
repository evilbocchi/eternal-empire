/**
 * @fileoverview AtmosphereController - Client controller for managing area lighting and atmosphere effects.
 *
 * Handles:
 * - Tracking and updating light sources in each area
 * - Adjusting light brightness and shadows based on quality settings and time of day
 * - Integrating with area data and user game settings
 *
 * The controller manages dynamic lighting and atmosphere effects to enhance the visual experience in different areas.
 *
 * @since 1.0.0
 */
import { Controller, OnInit, OnStart } from "@flamework/core";
import { Lighting } from "@rbxts/services";
import { AREAS } from "shared/Area";
import ItemUtils from "shared/item/ItemUtils";

/**
 * Controller responsible for managing area lighting and atmosphere effects.
 *
 * Tracks light sources, updates brightness and shadows based on quality settings and time of day.
 */
@Controller()
export default class AtmosphereController implements OnInit, OnStart {

    /** Map of Light instances to their base brightness. */
    lights = new Map<Light, number>();

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
                    light.Brightness = qualityLevel === 1 ? 0 : (math.abs(Lighting.ClockTime - 12) / 8 - 0.25) * base * 2;
                }
                oldQualityLevel = qualityLevel;
            }
        });
    }
}