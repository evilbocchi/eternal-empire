/**
 * @fileoverview Client controller for managing hotkey bindings and UI button actions.
 *
 * Handles:
 * - Binding hotkeys to actions with optional priorities and labels
 * - Integrating hotkeys with UI buttons and tooltips
 * - Executing actions on hotkey press and release
 * - Managing hotkey tooltips and button connections
 *
 * The controller maintains a list of binded keys, supports method chaining for configuration, and coordinates with TooltipController for UI feedback.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import TooltipController from "client/controllers/interface/TooltipController";

type BindedKey = { hotkey: Enum.KeyCode, action: (usedHotkey: boolean) => boolean, priority: number, name?: string, index: number, button?: GuiButton, endAction?: () => boolean; };

/**
 * Controller responsible for managing hotkey bindings and their integration with UI buttons and tooltips.
 *
 * Supports binding actions to hotkeys, setting up tooltips, and handling input events for hotkey execution.
 */
@Controller()
export default class HotkeysController implements OnInit {
    /** List of currently binded keys and their associated actions. */
    bindedKeys: BindedKey[] = [];
    /** Map of UI buttons to their activation connections. */
    connections = new Map<GuiObject, RBXScriptConnection>();
    /** Whether hotkey binds are currently disabled. */
    bindsDisabled = false;
    /** Internal index for ordering binds. */
    index = 0;

    constructor(private tooltipController: TooltipController) {

    }

    /**
     * Executes the action associated with a given hotkey, if any.
     * @param hotkey The key code to execute.
     */
    execute(hotkey: Enum.KeyCode) {
        for (const binded of this.bindedKeys) {
            if (hotkey === binded.hotkey && binded.action(true) === true)
                return;
        }
    }

    /**
     * Sets or updates the tooltip for a button, including hotkey label if provided.
     * @param button The UI button to set the tooltip for.
     * @param keyCode The hotkey to display (optional).
     * @param label The label to use for the tooltip (optional).
     * @param hideHotkey Whether to hide the hotkey in the tooltip (optional).
     * @returns The tooltip label used.
     */
    tooltip(button: GuiButton, keyCode: Enum.KeyCode | undefined, label?: string, hideHotkey?: boolean) {
        let l = button.GetAttribute("Tooltip") as string;
        if (l === undefined) {
            l = (label === undefined ? (button.IsA("TextButton") ? button.Text : button.Name) : label);
            button.SetAttribute("Tooltip", l);
        }
        this.tooltipController.setMessage(button, keyCode === undefined || hideHotkey === true ? l : `${l} (${keyCode.Name})`);
        return l;
    }

    /**
     * Binds a hotkey and/or button to an action, sets up tooltip and activation connection.
     * @param button The UI button to bind.
     * @param keyCode The hotkey to bind (optional).
     * @param action The action to execute on activation.
     * @param label The label for the tooltip (optional).
     * @param priority The priority for hotkey execution (optional).
     * @param endAction The action to execute on key release (optional).
     * @param hideHotkey Whether to hide the hotkey in the tooltip (optional).
     */
    setHotkey(button: GuiButton, keyCode: Enum.KeyCode | undefined, action: (usedHotkey: boolean) => boolean, label?: string, priority?: number, endAction?: () => boolean, hideHotkey?: boolean) {
        const l = this.tooltip(button, keyCode, label, hideHotkey);
        if (keyCode !== undefined)
            this.bindKey(keyCode, action, priority, l, button, endAction);

        if (this.connections.has(button) === false) {
            const connection = button.Activated.Connect(() => action(false));
            this.connections.set(button, connection);
            button.Destroying.Once(() => {
                connection.Disconnect();
                this.connections.delete(button);
            });
        }
    }

    /**
     * Binds a hotkey to an action with optional priority, label, button, and endAction.
     * @param keyCode The hotkey to bind.
     * @param action The action to execute on activation.
     * @param priority The priority for hotkey execution (optional).
     * @param name The label for the hotkey (optional).
     * @param button The UI button associated with the hotkey (optional).
     * @param endAction The action to execute on key release (optional).
     */
    bindKey(keyCode: Enum.KeyCode, action: (usedHotkey: boolean) => boolean, priority?: number, name?: string, button?: GuiButton, endAction?: () => boolean) {
        this.bindedKeys.push({ hotkey: keyCode, action: action, priority: priority ?? 0, name: name, index: ++this.index, button: button, endAction: endAction });
        this.bindedKeys = this.bindedKeys.sort((a, b) => a.priority > b.priority);
    }

    /**
     * Initializes the HotkeysController, sets up input event listeners for hotkey execution and release.
     */
    onInit() {
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true || this.bindsDisabled === true) {
                return;
            }
            this.execute(input.KeyCode);
        });
        UserInputService.InputEnded.Connect((input, gameProcessed) => {
            if (gameProcessed === true || this.bindsDisabled === true) {
                return;
            }
            for (const binded of this.bindedKeys) {
                if (input.KeyCode === binded.hotkey && binded.endAction !== undefined && binded.endAction() === true)
                    return;
            }
        });
    }
}