/**
 * @fileoverview Client controller for managing the settings window UI and hotkey/settings interactions.
 *
 * Handles:
 * - Displaying and updating hotkey bindings
 * - Managing toggleable settings and their UI state
 * - Integrating with HotkeysController and UIController for feedback
 * - Observing and updating settings state from the server
 *
 * The controller manages the settings window, hotkey rebinding, and toggleable options, providing a responsive settings interface.
 *
 * @since 1.0.0
 */
import SerikaNum from "@antivivi/serikanum";
import { Controller, OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import HotkeysController from "client/controllers/core/HotkeysController";
import { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/core/AdaptiveTabController";
import UIController from "client/controllers/core/UIController";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";
import { paintObjects } from "@antivivi/vrldk";

/**
 * Controller responsible for managing the settings window UI, hotkey rebinding, and toggleable settings.
 *
 * Handles hotkey UI, toggle state, and updates in response to server settings changes.
 */
@Controller()
export default class SettingsController implements OnStart {

    constructor(private hotkeysController: HotkeysController, private uiController: UIController) {

    }

    /**
     * Finds the Enum.KeyCode matching a given value.
     * @param value The numeric value of the key code.
     * @returns The matching Enum.KeyCode, or undefined.
     */
    getMatchingKeyCodeFromValue(value: number) {
        const items = Enum.KeyCode.GetEnumItems();
        for (const keycode of items) {
            if (keycode.Value === value) {
                return keycode;
            }
        }
    }

    /**
     * Starts the SettingsController, sets up hotkey and toggle UI, and observes settings changes.
     */
    onStart() {
        Packets.settings.observe((value) => {
            SerikaNum.changeDefaultAbbreviation(value.ScientificNotation === true ? "scientific" : "suffix");

            const bindedKeys = this.hotkeysController.bindedKeys;
            for (const [name, code] of pairs(value.hotkeys)) {
                const keyCode = this.getMatchingKeyCodeFromValue(code);
                for (const bindedKey of bindedKeys) {
                    if (bindedKey.name === name && keyCode !== undefined) {
                        bindedKey.hotkey = keyCode;
                        if (bindedKey.button !== undefined) {
                            this.hotkeysController.tooltip(bindedKey.button, keyCode);
                        }
                    }
                }
            }
        });
    }
}