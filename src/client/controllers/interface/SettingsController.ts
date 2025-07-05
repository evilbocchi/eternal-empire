import SerikaNum from "@antivivi/serikanum";
import { Controller, OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import HotkeysController from "client/controllers/HotkeysController";
import { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/interface/AdaptiveTabController";
import UIController from "client/controllers/UIController";
import { ASSETS } from "shared/asset/GameAssets";
import Packets from "shared/Packets";
import { paintObjects } from "@antivivi/vrldk";

declare global {
    type HotkeyOption = Frame & {
        Bind: TextButton & {
            KeybindLabel: TextLabel;
        },
        TitleLabel: TextLabel;
    };

    interface Assets {
        SettingsWindow: Folder & {
            HotkeyOption: HotkeyOption;
        };
    }
}

export const SETTINGS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Settings") as Frame & {
    InteractionOptions: Frame & {

    };
};

@Controller()
export default class SettingsController implements OnStart {

    selectedOption: HotkeyOption | undefined = undefined;

    constructor(private hotkeysController: HotkeysController, private uiController: UIController) {

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

    refreshToggle(setting: string, enabled: boolean) {
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
            const option = ASSETS.SettingsWindow.HotkeyOption.Clone();
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
            if (input.KeyCode !== Enum.KeyCode.Unknown && input.KeyCode !== undefined && this.selectedOption !== undefined) {
                const name = this.selectedOption.Name;
                this.deselectOption();
                Packets.setHotkey.inform(name, input.KeyCode.Value);
            }
        });

        for (const settingOption of SETTINGS_WINDOW.InteractionOptions.GetChildren()) {
            const toggle = settingOption.FindFirstChild("Toggle") as TextButton;
            if (toggle !== undefined) {
                toggle.Activated.Connect(() => {
                    const setting = settingOption.Name as keyof Settings;
                    const updated = !Packets.settings.get()[setting];
                    this.uiController.playSound(updated === true ? "SwitchFlick" : "SwitchFlickLowPitch");

                    Packets.setSetting.inform(setting, updated);
                });
            }
        }

        Packets.settings.observe((value) => {
            for (const [setting, v] of pairs(value)) {
                this.refreshToggle(setting, v === true);
            }
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
                this.hotkeysController.bindedKeys = bindedKeys;
                const option = SETTINGS_WINDOW.InteractionOptions.FindFirstChild(name) as HotkeyOption;
                if (option === undefined) {
                    continue;
                }
                option.Bind.KeybindLabel.Text = keyCode?.Name ?? "None";
            }
        });
    }
}