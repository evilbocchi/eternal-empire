//!native
//!optimize 2

/**
 * @fileoverview Handles environmental effects such as lighting.
 *
 * This service is responsible for:
 * - Progressing the in-game time by updating Lighting.ClockTime
 *
 * @since 1.0.0
 */

import { OnInit, OnPhysics, Service } from "@flamework/core";
import { Lighting } from "@rbxts/services";

/**
 * Service that manages atmospheric effects.
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

    onInit() {

    }
}