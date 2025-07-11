import { Controller, OnInit, OnPhysics } from "@flamework/core";
import { Lighting } from "@rbxts/services";
import { AREAS } from "shared/constants";

@Controller()
export class AtmosphereController implements OnInit, OnPhysics {

    lights = new Map<Light, number>();

    findLight(lightSourceContainer: Instance) {
        return lightSourceContainer.FindFirstChild("LightSource")?.FindFirstChildWhichIsA("Light");
    }

    onPhysics() {
        for (const [light, base] of this.lights) {
            light.Brightness = (math.abs(Lighting.ClockTime - 12) / 8 - 0.25) * base * 2;
        }
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
}