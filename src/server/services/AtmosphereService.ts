import { OnInit, OnPhysics, Service } from "@flamework/core";
import { Lighting } from "@rbxts/services";
import { AREAS, ASSETS, SOUND_EFFECTS_GROUP } from "shared/constants";

@Service()
export class AtmosphereService implements OnInit, OnPhysics {

    lights = new Array<Light>();

    findLight(lightSourceContainer: Instance) {
        return lightSourceContainer.FindFirstChild("LightSource")?.FindFirstChildWhichIsA("Light");
    }

    onPhysics(dt: number) {
        Lighting.ClockTime += dt * 0.02;
        for (const light of this.lights) {
            light.Brightness = math.abs(Lighting.ClockTime - 12) / 12 - 0.25;
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
                        this.lights.push(light);
                }
            }
        }

        for (const sound of ASSETS.Sounds.GetChildren()) {
            if (sound.IsA("Sound"))
                sound.SoundGroup = SOUND_EFFECTS_GROUP;
        }
    }
}