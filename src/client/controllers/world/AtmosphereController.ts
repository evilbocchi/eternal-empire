import { Controller, OnInit, OnStart } from "@flamework/core";
import { Lighting } from "@rbxts/services";
import { AREAS } from "shared/Area";
import ItemUtils from "shared/item/ItemUtils";

@Controller()
export default class AtmosphereController implements OnInit, OnStart {

    lights = new Map<Light, number>();

    findLight(lightSourceContainer: Instance) {
        const light = lightSourceContainer.FindFirstChildOfClass("Light");
        if (light !== undefined) {
            return light;
        }

        return lightSourceContainer.FindFirstChild("LightSource")?.FindFirstChildWhichIsA("Light");
    }

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