import { Controller, OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import { SETTINGS_WINDOW } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { HotkeyOption, UI_ASSETS } from "shared/constants";
import { Fletchette } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { paintObjects } from "shared/utils/vrldk/UIUtils";

const SettingsCanister = Fletchette.getCanister("SettingsCanister");

@Controller()
export class SettingsController implements OnStart {

    selectedOption: HotkeyOption | undefined = undefined;

    constructor(private hotkeysController: HotkeysController) {
        
    }

    selectOption(option: HotkeyOption) {
        paintObjects(option.Bind, Color3.fromRGB(255, 138, 138));
        option.Bind.KeybindLabel.Text = "..";
        this.selectedOption = option;
        this.hotkeysController.bindsDisabled = true;
    }

    deselectOption() {
        const option = this.selectedOption;
        if (option === undefined) {
            return;
        }
        paintObjects(option.Bind, Color3.fromRGB(85, 255, 127));
        option.Bind.KeybindLabel.Text = option.Bind.GetAttribute("Original") as string;
        this.selectedOption = undefined;
        task.delay(0.5, () => this.hotkeysController.bindsDisabled = false);
    }

    getMatchingKeyCodeFromValue(value: number) {
        const items = Enum.KeyCode.GetEnumItems();
        for (const keycode of items) {
            if (keycode.Value === value) {
                return keycode;
            }
        }
    }

    refreshToggle(setting: keyof Settings, enabled: boolean) {
        const toggle = SETTINGS_WINDOW.InteractionOptions.FindFirstChild(setting)?.FindFirstChild("Toggle");
        if (toggle === undefined) {
            return;
        }
        paintObjects(toggle, enabled === true ? Color3.fromRGB(170, 255, 127) : Color3.fromRGB(255, 52, 52));
        return toggle;
    }

    onStart() {
        this.hotkeysController.bindedKeys.forEach((value) => {
            const name = value.name;
            if (name === undefined) {
                return;
            }
            const cached = SETTINGS_WINDOW.InteractionOptions.FindFirstChild(name);
            if (cached !== undefined) {
                return;
            }
            const option = UI_ASSETS.SettingsWindow.HotkeyOption.Clone();
            option.Name = name;
            const key = value.hotkey.Name;
            option.Bind.SetAttribute("Original", key);
            option.Bind.KeybindLabel.Text = key;
            option.TitleLabel.Text = name;
            option.Bind.Activated.Connect(() => this.selectOption(option));
            option.LayoutOrder = value.index + 100;
            option.Parent = SETTINGS_WINDOW.InteractionOptions;
        });

        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed === true) {
                return;
            }
            if (input.UserInputType === Enum.UserInputType.MouseButton1) {
                this.deselectOption();
            }
            if (input.KeyCode !== undefined && this.selectedOption !== undefined) {
                const name = this.selectedOption.Name;
                this.deselectOption();
                SettingsCanister.setHotkey.fire(name, input.KeyCode.Value);
            }
        });

        for (const settingOption of SETTINGS_WINDOW.InteractionOptions.GetChildren()) {
            const toggle = settingOption.FindFirstChild("Toggle") as TextButton;
            if (toggle !== undefined) {
                toggle.Activated.Connect(() => {
                    const setting = settingOption.Name as keyof Settings;
                    SettingsCanister.setSetting.fire(setting, !SettingsCanister.settings.get()[setting]);
                });
            }
        }

        SettingsCanister.settings.observe((value) => {
            for (const [setting, v] of pairs(value)) {
                this.refreshToggle(setting, v === true);
            }
            InfiniteMath.useScientific(value.ScientificNotation === true);            
        
            for (const [name, code] of value.hotkeys) {
                const keyCode = this.getMatchingKeyCodeFromValue(code);
                const bindedKeys = this.hotkeysController.bindedKeys;
                for (const bindedKey of bindedKeys) {
                    if (bindedKey.name === name && keyCode !== undefined) {
                        bindedKey.hotkey = keyCode;
                        if (bindedKey.button !== undefined) {
                            this.hotkeysController.tooltip(bindedKey.button, keyCode);
                        }
                    }
                }
                this.hotkeysController.bindedKeys = bindedKeys;
                const option = SETTINGS_WINDOW.InteractionOptions.FindFirstChild(name) as HotkeyOption;
                if (option === undefined) {
                    warn(`No such hotkey ${name} exists`);
                    continue;
                }
                option.Bind.KeybindLabel.Text = keyCode?.Name ?? "None";
            }
        });
    }
}