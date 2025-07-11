import { Controller, OnInit } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import { TooltipController } from "client/controllers/interface/TooltipController";

type BindedKey = {hotkey: Enum.KeyCode, action: () => boolean, priority: number};

@Controller()
export class HotkeysController implements OnInit {    
    bindedKeys: BindedKey[] = [];
    connections = new Map<GuiObject, RBXScriptConnection>();
    
    constructor(private tooltipController: TooltipController) {
        
    }

    execute(hotkey: Enum.KeyCode) {
        for (const binded of this.bindedKeys) {
            if (hotkey === binded.hotkey && binded.action())
                return;
        }
    }
    
    setHotkey(button: GuiButton, keyCode: Enum.KeyCode, action: () => boolean, label?: string, priority?: number) {
        this.bindKey(keyCode, action, priority);
        if (!this.connections.has(button)) {
            const connection = button.Activated.Connect(() => this.execute(keyCode));
            this.connections.set(button, connection);
            button.Destroying.Once(() => {
                connection.Disconnect();
                this.connections.delete(button);
            });
        }
        this.tooltipController.setTooltip(button, (label === undefined ? (button.IsA("TextButton") ? button.Text : button.Name) : label) + " (" + keyCode.Name + ")");
    }

    bindKey(keyCode: Enum.KeyCode, action: () => boolean, priority?: number) {
        this.bindedKeys.push({hotkey: keyCode, action: action, priority: priority ?? 0});
        this.bindedKeys = this.bindedKeys.sort((a, b) => a.priority > b.priority);
    }

    onInit() {
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) {
                return;
            }
            this.execute(input.KeyCode);
        });
    }
}