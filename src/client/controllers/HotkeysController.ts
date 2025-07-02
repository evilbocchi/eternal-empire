import { Controller, OnInit } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import TooltipController from "client/controllers/interface/TooltipController";

type BindedKey = { hotkey: Enum.KeyCode, action: (usedHotkey: boolean) => boolean, priority: number, name?: string, index: number, button?: GuiButton, endAction?: () => boolean; };

@Controller()
export default class HotkeysController implements OnInit {
    bindedKeys: BindedKey[] = [];
    connections = new Map<GuiObject, RBXScriptConnection>();
    bindsDisabled = false;
    index = 0;

    constructor(private tooltipController: TooltipController) {

    }

    execute(hotkey: Enum.KeyCode) {
        for (const binded of this.bindedKeys) {
            if (hotkey === binded.hotkey && binded.action(true) === true)
                return;
        }
    }

    tooltip(button: GuiButton, keyCode: Enum.KeyCode | undefined, label?: string, hideHotkey?: boolean) {
        let l = button.GetAttribute("Tooltip") as string;
        if (l === undefined) {
            l = (label === undefined ? (button.IsA("TextButton") ? button.Text : button.Name) : label);
            button.SetAttribute("Tooltip", l);
        }
        this.tooltipController.setMessage(button, keyCode === undefined || hideHotkey === true ? l : `${l} (${keyCode.Name})`);
        return l;
    }

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

    bindKey(keyCode: Enum.KeyCode, action: (usedHotkey: boolean) => boolean, priority?: number, name?: string, button?: GuiButton, endAction?: () => boolean) {
        this.bindedKeys.push({ hotkey: keyCode, action: action, priority: priority ?? 0, name: name, index: ++this.index, button: button, endAction: endAction });
        this.bindedKeys = this.bindedKeys.sort((a, b) => a.priority > b.priority);
    }

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