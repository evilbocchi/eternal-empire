import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { ADAPTIVE_TAB, ADAPTIVE_TAB_MAIN_WINDOW, SIDEBAR_BUTTONS } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";

@Controller()
export class AdaptiveTabController implements OnInit {
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
        return SIDEBAR_BUTTONS.Visible = false;
    }
    
    showSidebarButtons() {
        return SIDEBAR_BUTTONS.Visible = true;
    }
    
    refreshSidebarButtons() {
        (SIDEBAR_BUTTONS.WaitForChild("Warp") as TextButton).Visible = false;
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

        for (const sidebarButton of SIDEBAR_BUTTONS.GetChildren()) {
            if (sidebarButton.IsA("TextButton")) {
                const hotkey = this.hotkeys.get(sidebarButton.Name);
                if (hotkey !== undefined) {
                    this.hotkeysController.setHotkey(sidebarButton, hotkey, () => {
                        this.uiController.playSound("Flip");
                        this.toggleAdaptiveTab(sidebarButton.Name);
                        return true;
                    }, sidebarButton.Name)
                }
                this.colorsPerWindow.set(sidebarButton.Name, sidebarButton.WaitForChild("ImageLabel") as ImageLabel & { UIGradient: UIGradient });
            }
        }
        this.refreshSidebarButtons();
    }
}
