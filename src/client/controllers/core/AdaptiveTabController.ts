/**
 * @fileoverview Client controller responsible for managing the adaptive tab UI and sidebar navigation.
 *
 * Handles:
 * - Showing and hiding the adaptive tab and its windows
 * - Animating tab and sidebar transitions
 * - Managing hotkeys for tab and sidebar navigation
 * - Integrating with UI and hotkey controllers
 * - Tracking and updating the current window and sidebar state
 *
 * The controller maintains mappings between window names and their colors/images, manages blur and camera effects, and coordinates with other controllers for UI and hotkey actions.
 *
 * @since 1.0.0
 */
import Signal from "@antivivi/lemon-signal";
import { Controller, OnInit } from "@flamework/core";
import { Lighting, TweenService, Workspace } from "@rbxts/services";
import HotkeysController from "client/controllers/core/HotkeysController";
import { INTERFACE } from "client/controllers/core/UIController";
import QuestsController from "client/controllers/interface/QuestsController";
import { playSound } from "shared/asset/GameAssets";

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

/**
 * Controller responsible for managing the adaptive tab UI, sidebar navigation, and related animations.
 *
 * Handles tab/window transitions, sidebar button setup, and integration with hotkeys and UI controllers.
 */
@Controller()
export default class AdaptiveTabController implements OnInit {
    /** Signal fired when a tab is hidden. */
    tabHidden = new Signal<string>();
    /** The original position of the sidebar buttons. */
    originalSidebarPosition = SIDEBAR_BUTTONS.Position;
    /** Mapping of window names to their color. */
    colorsPerWindow = new Map<string, Color3>();
    /** Mapping of window names to their image. */
    imagePerWindow = new Map<string, string>();
    /** The currently active window. */
    currentWindow = undefined as Frame | undefined;
    /** Mapping of window names to their hotkey. */
    hotkeys = new Map<string, Enum.KeyCode>();
    /** Blur effect instance for tab transitions. */
    blur = (function () {
        const blur = new Instance("BlurEffect");
        blur.Size = 0;
        blur.Enabled = false;
        blur.Parent = Lighting;
        return blur;
    })();

    constructor(
        private hotkeysController: HotkeysController,
        private questsController: QuestsController
    ) {
    }

    /**
     * Animates and hides the adaptive tab window.
     */
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

    /**
     * Animates and shows the adaptive tab window for a given window name.
     * Special handling for Quests to use the standalone window.
     * @param windowName The name of the window to show.
     */
    showAdaptiveTab(windowName: string) {
        // Special case: Redirect quest window to standalone implementation
        if (windowName === "Quests") {
            this.questsController.showQuestWindow();
            return;
        }

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

    /**
     * Refreshes the adaptive tab UI for a given window name.
     * @param windowName The name of the window to refresh.
     */
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

    /**
     * Toggles the adaptive tab window for a given window name.
     * Special handling for Quests to use the standalone window.
     * @param windowName The name of the window to toggle (optional).
     * @returns True if the tab was shown, false if hidden or unchanged.
     */
    toggleAdaptiveTab(windowName?: string) {
        // Special case: Redirect quest window to standalone implementation
        if (windowName === "Quests") {
            return this.questsController.toggleQuestWindow();
        }

        if (ADAPTIVE_TAB.Active && windowName === this.currentWindow?.Name) {
            this.hideAdaptiveTab();
            return false;
        }
        else if (windowName !== undefined) {
            this.showAdaptiveTab(windowName);
            return true;
        }
    }

    /**
     * Animates and hides the sidebar buttons.
     */
    hideSidebarButtons() {
        TweenService.Create(SIDEBAR_BUTTONS, new TweenInfo(0.5), { Position: new UDim2(-0.015, -50, 0.5, 0) }).Play();
    }

    /**
     * Animates and shows the sidebar buttons.
     */
    showSidebarButtons() {
        TweenService.Create(SIDEBAR_BUTTONS, new TweenInfo(0.5), { Position: this.originalSidebarPosition }).Play();
    }

    /**
     * Loads a sidebar button, sets up hotkey and color/image mapping.
     * @param sidebarButton The sidebar button GUI element.
     */
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
                    playSound("MenuOpen.mp3");
                else
                    playSound("MenuClose.mp3");

                return true;
            }, optionName);
        }

        if (sidebarButton.IsA("ImageButton"))
            this.imagePerWindow.set(optionName, sidebarButton.Image);

        this.colorsPerWindow.set(optionName, sidebarButton.BackgroundColor3);
    }

    /**
     * Initializes the AdaptiveTabController, sets up hotkeys and loads sidebar buttons.
     */
    onInit() {
        this.hotkeysController.setHotkey(ADAPTIVE_TAB.CloseButton, Enum.KeyCode.X, () => {
            if (ADAPTIVE_TAB.Visible === true) {
                playSound("MenuClose.mp3");
                this.hideAdaptiveTab();
                return true;
            }
            return false;
        }, "Close");
        this.hotkeys.set("Inventory", Enum.KeyCode.F);
        this.hotkeys.set("Stats", Enum.KeyCode.M);
        this.hotkeys.set("Quests", Enum.KeyCode.V);
        this.hotkeys.set("Warp", Enum.KeyCode.G);
        for (const sidebarButton of SIDEBAR_BUTTONS.GetDescendants()) {
            if (sidebarButton.IsA("GuiButton"))
                this.loadSidebarButton(sidebarButton);
        }
    }
}
