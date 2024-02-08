import { Controller, OnInit } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import { TooltipController } from "client/controllers/interface/TooltipController";

type BindedKey = {hotkey: Enum.KeyCode, action: () => boolean, priority: number};

@Controller()
export class HotkeysController implements OnInit {    
    bindedKeys: BindedKey[] = [];
    
    constructor(private tooltipController: TooltipController) {
        
    }
    
    setHotkey(button: TextButton, keyCode: Enum.KeyCode, action: () => boolean, label?: string, priority?: number) {
        this.bindKey(keyCode, action, priority);
        button.Activated.Connect(() => action());
        this.tooltipController.setTooltip(button, (label === undefined ? button.Text : label) + " (" + keyCode.Name + ")");
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
            for (const binded of this.bindedKeys) {
                if (binded.hotkey === input.KeyCode && binded.action())
                    return;
            }
        });
    }
}