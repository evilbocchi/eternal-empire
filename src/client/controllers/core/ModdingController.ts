import { Controller, Modding, OnInit } from "@flamework/core";
import { LOCAL_PLAYER } from "client/constants";

export interface OnCharacterAdded {
    onCharacterAdded(character: Model): void;
}

@Controller()
export default class ModdingController implements OnInit {
    onInit() {
        const listeners = new Set<OnCharacterAdded>();
        Modding.onListenerAdded<OnCharacterAdded>((object) => listeners.add(object));
        Modding.onListenerRemoved<OnCharacterAdded>((object) => listeners.delete(object));

        LOCAL_PLAYER.CharacterAdded.Connect((character) => {
            for (const listener of listeners) {
                task.spawn(() => listener.onCharacterAdded(character));
            }
        });
        const character = LOCAL_PLAYER.Character;
        if (character !== undefined) {
            for (const listener of listeners) {
                task.spawn(() => listener.onCharacterAdded(character));
            }
        }
    }
}