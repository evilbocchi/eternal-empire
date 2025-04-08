//!native
//!optimize 2

import { OnInit, OnPhysics, Service } from "@flamework/core";
import { Lighting } from "@rbxts/services";
import { SOUND_EFFECTS_GROUP } from "shared/constants";
import { ASSETS } from "shared/GameAssets";

declare global {
    interface Assets {
        Sounds: Folder & {
            [key: string]: Sound;
        };
    }
}

@Service()
export class AtmosphereService implements OnInit, OnPhysics {

    onPhysics(dt: number) {
        Lighting.ClockTime += dt * 0.02;
    }

    onInit() {
        for (const sound of ASSETS.Sounds.GetChildren()) {
            if (sound.IsA("Sound"))
                sound.SoundGroup = SOUND_EFFECTS_GROUP;
        }
    }
}