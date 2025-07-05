import Signal from "@antivivi/lemon-signal";
import { Controller, OnInit } from "@flamework/core";
import { Lighting, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import HotkeysController from "client/controllers/HotkeysController";
import UIController, { INTERFACE } from "client/controllers/UIController";

declare global {
    type SidebarOption = Frame & {
        Button: ImageButton;
        Glow: Frame;
    };
}

export const ADAPTIVE_TAB = INTERFACE.WaitForChild("AdaptiveTab") as Frame & {
    CloseButton: TextButton,
    UIStroke: UIStroke & {
        UIGradient: UIGradient;
    },
    Title: Frame & {
        ImageLabel: ImageLabel,
        TextLabel: TextLabel;
    },
};

export const ADAPTIVE_TAB_MAIN_WINDOW = ADAPTIVE_TAB.WaitForChild("MainWindow") as Frame;

export const SIDEBAR_BUTTONS = INTERFACE.WaitForChild("SidebarButtons") as Frame & {
    Quests: Frame & {
        NotificationWindow: Frame & {
            AmountLabel: TextLabel;
        };
    };
};

@Controller()
export default class AdaptiveTabController implements OnInit {

    tabHidden = new Signal<string>();
    originalSidebarPosition = SIDEBAR_BUTTONS.Position;
    colorsPerWindow = new Map<string, Color3>();
    imagePerWindow = new Map<string, string>();
    currentWindow = undefined as Frame | undefined;
    hotkeys = new Map<string, Enum.KeyCode>();
    blur = (function () {
        const blur = new Instance("BlurEffect");
        blur.Size = 0;
        blur.Enabled = false;
        blur.Parent = Lighting;
        return blur;
    })();

    constructor(private hotkeysController: HotkeysController, private uiController: UIController) {

    }

    hideAdaptiveTab() {
        const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Linear, Enum.EasingDirection.In);

        ADAPTIVE_TAB.Active = false;

        const tween = TweenService.Create(ADAPTIVE_TAB, tweenInfo, { Position: new UDim2(0.5, 0, 1, -5) });
        tween.Play();
        tween.Completed.Once((playbackState) => {
            if (playbackState !== Enum.PlaybackState.Completed)
                return;

            ADAPTIVE_TAB.Visible = false;
            if (this.currentWindow !== undefined) {
                this.tabHidden.fire(this.currentWindow.Name);
                this.currentWindow.Visible = false;
            }
            this.blur.Enabled = false;
        });

        TweenService.Create(Workspace.CurrentCamera!, tweenInfo, { FieldOfView: 70 }).Play();
        TweenService.Create(this.blur, tweenInfo, { Size: 0 }).Play();
    }

    showAdaptiveTab(windowName: string) {
        const tweenInfo = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);

        if (this.currentWindow !== undefined && this.currentWindow.Name !== windowName) {
            this.currentWindow.Visible = false;
        }
        if (!ADAPTIVE_TAB.Visible)
            ADAPTIVE_TAB.Position = new UDim2(0.5, 0, 1, -20);

        ADAPTIVE_TAB.Active = true;
        ADAPTIVE_TAB.Visible = true;
        this.refreshAdaptiveTab(windowName);

        TweenService.Create(ADAPTIVE_TAB, tweenInfo, { Position: new UDim2(0.5, 0, 1, -40) }).Play();
        TweenService.Create(Workspace.CurrentCamera!, tweenInfo, { FieldOfView: 75 }).Play();
        TweenService.Create(this.blur, tweenInfo, { Size: 10 }).Play();
        this.blur.Enabled = true;
    }

    refreshAdaptiveTab(windowName: string) {
        const window = (ADAPTIVE_TAB_MAIN_WINDOW.FindFirstChild(windowName) as Frame);
        if (window === undefined) {
            return;
        }
        window.Visible = true;
        ADAPTIVE_TAB.Title.TextLabel.Text = windowName;
        ADAPTIVE_TAB.Title.ImageLabel.Image = this.imagePerWindow.get(windowName) ?? "";
        ADAPTIVE_TAB.UIStroke.Color = this.colorsPerWindow.get(windowName) ?? Color3.fromRGB();
        this.currentWindow = window;
    }

    toggleAdaptiveTab(windowName?: string) {
        if (ADAPTIVE_TAB.Active && windowName === this.currentWindow?.Name) {
            this.hideAdaptiveTab();
            return false;
        }
        else if (windowName !== undefined) {
            this.showAdaptiveTab(windowName);
            return true;
        }
    }

    hideSidebarButtons() {
        TweenService.Create(SIDEBAR_BUTTONS, new TweenInfo(0.5), { Position: new UDim2(-0.015, -50, 0.5, 0) }).Play();
    }

    showSidebarButtons() {
        TweenService.Create(SIDEBAR_BUTTONS, new TweenInfo(0.5), { Position: this.originalSidebarPosition }).Play();
    }

    refreshSidebarButtons() {
        //(SIDEBAR_BUTTONS.WaitForChild("Warp") as GuiObject).Visible = LOCAL_PLAYER.GetAttribute("UsedPortal") === true;
    }

    loadSidebarButton(sidebarButton: GuiButton) {
        const optionName = sidebarButton.Name === "Button" ? sidebarButton.Parent?.Name : sidebarButton.Name;
        if (optionName === undefined)
            throw `Sidebar button has no name`;

        const hotkey = this.hotkeys.get(optionName);
        const tweenInfo = new TweenInfo(0.2);

        if (hotkey !== undefined) {
            this.hotkeysController.setHotkey(sidebarButton, hotkey, () => {
                sidebarButton.Size = new UDim2(0.9, 0, 0.9, 0);
                TweenService.Create(sidebarButton, tweenInfo, { Size: new UDim2(1, 0, 1, 0) }).Play();
                const result = this.toggleAdaptiveTab(optionName);
                if (result === true)
                    this.uiController.playSound("GravityIn");
                else
                    this.uiController.playSound("GravityOut");

                return true;
            }, optionName);
        }

        if (sidebarButton.IsA("ImageButton"))
            this.imagePerWindow.set(optionName, sidebarButton.Image);

        this.colorsPerWindow.set(optionName, sidebarButton.BackgroundColor3);
    }

    onInit() {
        this.hotkeysController.setHotkey(ADAPTIVE_TAB.CloseButton, Enum.KeyCode.X, () => {
            if (ADAPTIVE_TAB.Visible === true) {
                this.uiController.playSound("Flip");
                this.hideAdaptiveTab();
                return true;
            }
            return false;
        }, "Close");
        this.hotkeys.set("Inventory", Enum.KeyCode.F);
        this.hotkeys.set("Stats", Enum.KeyCode.M);
        this.hotkeys.set("Settings", Enum.KeyCode.P);
        this.hotkeys.set("Quests", Enum.KeyCode.V);
        this.hotkeys.set("Warp", Enum.KeyCode.G);
        for (const sidebarButton of SIDEBAR_BUTTONS.GetDescendants()) {
            if (sidebarButton.IsA("GuiButton"))
                this.loadSidebarButton(sidebarButton);
        }
        LOCAL_PLAYER.GetAttributeChangedSignal("UsedPortal").Connect(() => this.refreshSidebarButtons());
        this.refreshSidebarButtons();
    }
}
