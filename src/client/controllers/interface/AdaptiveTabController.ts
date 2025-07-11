import Signal from "@antivivi/lemon-signal";
import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { ADAPTIVE_TAB, ADAPTIVE_TAB_MAIN_WINDOW, LOCAL_PLAYER, SIDEBAR_BUTTONS } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";

@Controller()
export class AdaptiveTabController implements OnInit {

    tabHidden = new Signal<string>();
    originalSidebarPosition = SIDEBAR_BUTTONS.Position;
    tween = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    colorsPerWindow = new Map<string, ImageLabel & {
        UIGradient: UIGradient
    }>();
    currentWindow = undefined as Frame | undefined;
    hotkeys = new Map<string, Enum.KeyCode>();

    constructor(private hotkeysController: HotkeysController, private uiController: UIController) {

    }

    hideAdaptiveTab() {
        ADAPTIVE_TAB.Active = false;
        if (this.currentWindow !== undefined) {
            this.tabHidden.fire(this.currentWindow.Name);
            this.currentWindow.Visible = false;
        }
        const tween = TweenService.Create(ADAPTIVE_TAB, this.tween, {Position: new UDim2(0.5, 0, 1.5, 104)})
        tween.Play();
        tween.Completed.Once((playbackState) => {
            if (playbackState === Enum.PlaybackState.Completed)
                ADAPTIVE_TAB.Visible = false;
        });
    }

    showAdaptiveTab(windowName: string) {
        if (this.currentWindow !== undefined && this.currentWindow.Name !== windowName) {
            this.currentWindow.Visible = false;
        }
        ADAPTIVE_TAB.Active = true;
        if (!ADAPTIVE_TAB.Visible)
            ADAPTIVE_TAB.Position = new UDim2(0.5, 0, 1.5, 104);

        ADAPTIVE_TAB.Visible = true;
        this.refreshAdaptiveTab(windowName);
        TweenService.Create(ADAPTIVE_TAB, this.tween, {Position: new UDim2(0.5, 0, 1, 4)}).Play();
    }

    refreshAdaptiveTab(windowName: string) {
        const window = (ADAPTIVE_TAB_MAIN_WINDOW.FindFirstChild(windowName) as Frame);
        if (window === undefined) {
            return;
        }
        window.Visible = true;
        ADAPTIVE_TAB.TitleLabel.Text = windowName;
        ADAPTIVE_TAB.UIStroke.Color = this.colorsPerWindow.get(windowName)?.ImageColor3 ?? Color3.fromRGB();
        ADAPTIVE_TAB.UIStroke.UIGradient.Color = this.colorsPerWindow.get(windowName)?.UIGradient.Color ?? new ColorSequence(Color3.fromRGB());
        this.currentWindow = window;
    }

    toggleAdaptiveTab(windowName?: string) {
        if (ADAPTIVE_TAB.Active && windowName === this.currentWindow?.Name) {
            this.hideAdaptiveTab();
        }
        else if (windowName !== undefined) {
            this.showAdaptiveTab(windowName);
        }
    }

    hideSidebarButtons() {
        TweenService.Create(SIDEBAR_BUTTONS, new TweenInfo(0.5), { Position: new UDim2(-0.015, -50, 0.5, 0) }).Play();
    }

    showSidebarButtons() {
        TweenService.Create(SIDEBAR_BUTTONS, new TweenInfo(0.5), { Position: this.originalSidebarPosition }).Play();
    }
    
    refreshSidebarButtons() {
        (SIDEBAR_BUTTONS.WaitForChild("Warp") as TextButton).Visible = LOCAL_PLAYER.GetAttribute("UsedPortal") === true;
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
            if (sidebarButton.IsA("TextButton")) {
                const hotkey = this.hotkeys.get(sidebarButton.Name);
                if (hotkey !== undefined) {
                    this.hotkeysController.setHotkey(sidebarButton, hotkey, () => {
                        this.uiController.playSound("Flip");
                        sidebarButton.Size = new UDim2(1.1, 0, 1.1, 0);
                        TweenService.Create(sidebarButton, new TweenInfo(0.2), {Size: new UDim2(1, 0, 1, 0)}).Play();
                        this.toggleAdaptiveTab(sidebarButton.Name);
                        return true;
                    }, sidebarButton.Name)
                }
                this.colorsPerWindow.set(sidebarButton.Name, sidebarButton.WaitForChild("ImageLabel") as ImageLabel & { UIGradient: UIGradient });
            }
        }
        LOCAL_PLAYER.GetAttributeChangedSignal("UsedPortal").Connect(() => this.refreshSidebarButtons());
        this.refreshSidebarButtons();
    }
}
