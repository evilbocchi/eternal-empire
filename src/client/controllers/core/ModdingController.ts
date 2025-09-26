/**
 * @fileoverview Client controller for managing modding listeners and character events.
 *
 * Handles:
 * - Registering and deregistering listeners for character addition
 * - Notifying listeners when the player's character is added or respawned
 * - Integrating with the Flamework Modding API
 *
 * The controller maintains a set of listeners implementing the OnCharacterAdded interface and ensures they are notified on character events.
 *
 * @since 1.0.0
 */
import { Controller, Modding, OnInit } from "@flamework/core";
import { LOCAL_PLAYER } from "client/constants";

/**
 * Interface for objects that listen for character addition events.
 */
export interface OnCharacterAdded {
    /**
     * Called when the player's character is added or respawned.
     * @param character The character model instance.
     */
    onCharacterAdded(character: Model): void;
}

/**
 * Controller responsible for managing modding listeners and dispatching character addition events.
 *
 * Registers listeners implementing OnCharacterAdded and notifies them when the player's character is added or respawned.
 */
@Controller()
export default class ModdingController implements OnInit {
    /**
     * Initializes the ModdingController, sets up listener registration and character event dispatch.
     */
    onInit() {
        const listeners = new Set<OnCharacterAdded>();
        Modding.onListenerAdded<OnCharacterAdded>((object) => listeners.add(object));
        Modding.onListenerRemoved<OnCharacterAdded>((object) => listeners.delete(object));

        LOCAL_PLAYER!.CharacterAdded.Connect((character) => {
            for (const listener of listeners) {
                task.spawn(() => listener.onCharacterAdded(character));
            }
        });
        const character = LOCAL_PLAYER!.Character;
        if (character !== undefined) {
            for (const listener of listeners) {
                task.spawn(() => listener.onCharacterAdded(character));
            }
        }
    }
}
