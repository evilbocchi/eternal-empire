//!native
//!optimize 2

/**
 * @fileoverview AtmosphereService - Handles environmental effects such as lighting and sound grouping.
 *
 * This service is responsible for:
 * - Progressing the in-game time by updating Lighting.ClockTime
 * - Assigning all sounds in the asset folder to the correct sound group
 *
 * @since 1.0.0
 */

import { OnInit, OnPhysics, Service } from "@flamework/core";
import { Lighting } from "@rbxts/services";
import { SOUND_EFFECTS_GROUP } from "shared/constants";
import { ASSETS } from "shared/asset/GameAssets";

// Extend the global Assets interface to include a Sounds folder
// containing all sound assets used in the game.
declare global {
    interface Assets {
        Sounds: Folder & {
            [key: string]: Sound;
        };
    }
}

/**
 * Service that manages atmospheric effects such as lighting and sound setup.
 */
@Service()
export default class AtmosphereService implements OnInit, OnPhysics {

    /**
     * Advances the in-game clock time to simulate day/night cycles.
     * Called every physics update.
     *
     * @param dt Delta time since last update.
     */
    onPhysics(dt: number) {
        Lighting.ClockTime += dt * 0.02;
    }

    /**
     * Initializes the atmosphere service by assigning all sounds
     * in the asset folder to the sound effects group.
     */
    onInit() {
        for (const sound of ASSETS.Sounds.GetChildren()) {
            if (sound.IsA("Sound"))
                sound.SoundGroup = SOUND_EFFECTS_GROUP;
        }
    }
}