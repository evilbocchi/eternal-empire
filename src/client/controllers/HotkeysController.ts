import { Controller, OnInit } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import { TooltipController } from "client/controllers/interface/TooltipController";

type BindedKey = {hotkey: Enum.KeyCode, action: () => boolean, priority: number, name?: string, index: number, button?: GuiButton};

@Controller()
export class HotkeysController implements OnInit {    
    bindedKeys: BindedKey[] = [];
    connections = new Map<GuiObject, RBXScriptConnection>();
    bindsDisabled = false;
    index = 0;
    
    constructor(private tooltipController: TooltipController) {
        
    }

    execute(hotkey: Enum.KeyCode) {
        for (const binded of this.bindedKeys) {
            if (hotkey === binded.hotkey && binded.action())
                return;
        }
    }

    tooltip(button: GuiButton, keyCode: Enum.KeyCode, label?: string) {
        let l = button.GetAttribute("Tooltip") as string;
        if (l === undefined) {
            l = (label === undefined ? (button.IsA("TextButton") ? button.Text : button.Name) : label);
            button.SetAttribute("Tooltip", l);
        }        
        this.tooltipController.setTooltip(button, `${l} (${keyCode.Name})`);
        return l;
    }
    
    setHotkey(button: GuiButton, keyCode: Enum.KeyCode, action: () => boolean, label?: string, priority?: number) {
        const l = this.tooltip(button, keyCode, label);
        this.bindKey(keyCode, action, priority, l, button);
        if (!this.connections.has(button)) {
            const connection = button.Activated.Connect(() => {
                for (const binded of this.bindedKeys) {
                    if (binded.button === button) {
                        this.execute(binded.hotkey);
                        return;
                    }
                }
            });
            this.connections.set(button, connection);
            button.Destroying.Once(() => {
                connection.Disconnect();
                this.connections.delete(button);
            });
        }
    }

    bindKey(keyCode: Enum.KeyCode, action: () => boolean, priority?: number, name?: string, button?: GuiButton) {
        this.bindedKeys.push({hotkey: keyCode, action: action, priority: priority ?? 0, name: name, index: ++this.index, button: button});
        this.bindedKeys = this.bindedKeys.sort((a, b) => a.priority > b.priority);
    }

    onInit() {
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true || this.bindsDisabled === true) {
                return;
            }
            this.execute(input.KeyCode);
        });
    }
}