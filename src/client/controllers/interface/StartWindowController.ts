/**
 * @fileoverview Client controller for managing the start screen, empire selection, and title UI.
 *
 * Handles:
 * - Showing and hiding the start/title screen and its transitions
 * - Managing empire selection, creation, and teleportation
 * - Integrating with UI, loading, intro, and sound controllers
 * - Animating UI elements and handling hotkeys for start screen actions
 *
 * The controller coordinates the start experience, empire management, and transitions to gameplay, ensuring a smooth onboarding flow for players.
 *
 * @since 1.0.0
 */
import ComputeNameColor from "@antivivi/rbxnamecolor";
import { combineHumanReadable, convertToHHMMSS, getHumanoid, paintObjects } from "@antivivi/vrldk";
import { Controller, OnInit } from "@flamework/core";
import { Players, ReplicatedFirst, RunService, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";
import HotkeysController from "client/controllers/core/HotkeysController";
import AdaptiveTabController from "client/controllers/core/AdaptiveTabController";
import BalanceWindowController from "client/controllers/interface/BalanceWindowController";
import IntroController from "client/controllers/interface/IntroController";
import LoadingWindowController from "client/controllers/interface/LoadingWindowController";
import { SETTINGS_WINDOW } from "client/controllers/interface/SettingsController";
import SoundController from "client/controllers/interface/SoundController";
import UIController from "client/controllers/core/UIController";
import { getNameFromUserId, getStartCamera, isStartScreenEnabled } from "shared/constants";
import { ASSETS } from "shared/asset/GameAssets";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

declare global {
    type PlayerSlot = Frame & {
        Avatar: ImageLabel;
    };

    interface EmpiresWindowAssets extends Folder {
        PlayerSlot: PlayerSlot,
        EmpireOption: TextButton & {
            UIStroke: UIStroke,
            EmpireIDLabel: TextLabel,
            EmpireInformation: Frame & {
                OwnerAvatar: ImageLabel,
                Labels: Frame & {
                    TitleLabel: TextLabel,
                    OwnerLabel: TextLabel,
                };
            },
            Stats: Frame & {
                DateCreatedLabel: TextLabel,
                ItemsLabel: TextLabel,
                PlaytimeLabel: TextLabel,
            },
        },
        NewEmpireOption: TextButton & {
            MessageLabel: TextLabel;
        },
    }

    interface Assets {
        EmpiresWindow: EmpiresWindowAssets;
    }
}

export type StartOption = Frame & {
    Button: ImageButton,
    ImageLabel: ImageLabel,
    Label: TextLabel & {
        UIStroke: UIStroke;
    };
};

export const START_WINDOW = ReplicatedFirst.WaitForChild("StartScreen") as ScreenGui & {
    AboutWindow: ScrollingFrame & {
        Contributors: Frame & {
            RecipientLabel: TextLabel;
        };
        CloseButton: ImageButton;
    };
    MainOptions: Frame & {
        Play: StartOption;
        Settings: StartOption;
        About: StartOption;
    };
    EmpiresWindow: Frame & {
        CloseButton: TextButton;
        EmpireOptions: ScrollingFrame;
        PublicEmpireWindow: Frame & {
            JoinPublicEmpire: TextButton;
        };
    };
    LeftBackground: ImageLabel;
    Logo: ImageLabel;
};

/**
 * Controller responsible for managing the start screen, empire selection, and title UI.
 *
 * Handles start screen transitions, empire management, and integration with other controllers for onboarding and UI feedback.
 */
@Controller()
export default class StartWindowController implements OnInit {
    constructor(
        private uiController: UIController,
        private adaptiveTabController: AdaptiveTabController,
        private balanceWindowController: BalanceWindowController,
        private loadingWindowController: LoadingWindowController,
        private introController: IntroController,
        private soundController: SoundController,
        private hotkeysController: HotkeysController
    ) {
    }

    /**
     * Hides the start window and transitions to gameplay, restoring UI and camera state.
     */
    hideStartWindow() {
        this.loadingWindowController.showLoadingWindow("Loading stuff");
        task.delay(1, () => {
            START_WINDOW.Parent = ReplicatedFirst;
            if (Workspace.CurrentCamera !== undefined) {
                Workspace.CurrentCamera.CameraType = Enum.CameraType.Custom;
                Workspace.CurrentCamera.CameraSubject = getHumanoid(LOCAL_PLAYER);
            }
            this.soundController.refreshMusic();
            this.balanceWindowController.showBalanceWindow();
            this.adaptiveTabController.showSidebarButtons();
            this.loadingWindowController.refreshLoadingWindow("Done loading");
            this.loadingWindowController.hideLoadingWindow();
        });
    }

    /**
     * Animates and shows the title screen UI elements.
     * @param fast If true, speeds up the animation.
     */
    showTitleScreen(fast?: boolean) {
        START_WINDOW.Logo.Position = new UDim2(-0.15, 0, 0, 0);
        START_WINDOW.Logo.Rotation = -80;
        START_WINDOW.LeftBackground.Position = new UDim2(-0.5, 0, 0.5, 0);
        const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Circular, Enum.EasingDirection.Out);
        const bounce = new TweenInfo(fast ? 0.75 : 1, Enum.EasingStyle.Back, Enum.EasingDirection.Out);
        const transitionOption = (option: typeof START_WINDOW.MainOptions.Play, del = 0) => {
            let i = option.ImageLabel.GetAttribute("OriginalPos") as UDim2;
            if (i === undefined) {
                i = option.ImageLabel.Position;
                option.ImageLabel.SetAttribute("OriginalPos", i);
            }
            option.Button.Position = new UDim2(0, -600, i.Y.Scale, i.Y.Offset);
            option.ImageLabel.Position = new UDim2(0, -556, i.Y.Scale, i.Y.Offset - 3);
            option.Label.TextTransparency = 1;
            option.Label.UIStroke.Transparency = 1;
            task.delay((fast ? 1 : 2) + del, () => {
                TweenService.Create(option.Button, bounce, { Position: i }).Play();
                TweenService.Create(option.ImageLabel, bounce, { Position: i.sub(new UDim2(0, -6, 0, -3)) }).Play();
                TweenService.Create(option.Label, new TweenInfo(1.4), { TextTransparency: 0 }).Play();
                TweenService.Create(option.Label.UIStroke, new TweenInfo(1.4), { Transparency: 0 }).Play();
            });
        };
        TweenService.Create(START_WINDOW.LeftBackground, tweenInfo, { Position: new UDim2(0, 0, 0.5, 0) }).Play();
        task.delay(fast ? 0.2 : 0.8, () => TweenService.Create(START_WINDOW.Logo, tweenInfo, { Position: new UDim2(0.15, 0, 0, 0), Rotation: 0 }).Play());
        transitionOption(START_WINDOW.MainOptions.Play);
        transitionOption(START_WINDOW.MainOptions.Settings, 0.2);
        transitionOption(START_WINDOW.MainOptions.About, 0.4);
        START_WINDOW.DisplayOrder = 4;
    }

    /**
     * Animates and hides the title screen UI elements.
     */
    hideTitleScreen() {
        const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Circular, Enum.EasingDirection.Out);
        TweenService.Create(START_WINDOW.LeftBackground, tweenInfo, { Position: new UDim2(-0.5, 0, 0.5, 0) }).Play();
        TweenService.Create(START_WINDOW.Logo, tweenInfo, { Position: new UDim2(-0.15, 0, 0, 0) }).Play();
        const transitionOption = (option: typeof START_WINDOW.MainOptions.Play) => {
            const i = option.ImageLabel.Position;
            const ref = new UDim2(0, -600, i.Y.Scale, i.Y.Offset);
            TweenService.Create(option.Button, tweenInfo, { Position: ref }).Play();
            TweenService.Create(option.ImageLabel, tweenInfo, { Position: ref.sub(new UDim2(0, -6, 0, -3)) }).Play();
            TweenService.Create(option.Label, tweenInfo, { TextTransparency: 1 }).Play();
            TweenService.Create(option.Label.UIStroke, tweenInfo, { Transparency: 1 }).Play();
        };
        transitionOption(START_WINDOW.MainOptions.Play);
        transitionOption(START_WINDOW.MainOptions.Settings);
        transitionOption(START_WINDOW.MainOptions.About);
        START_WINDOW.DisplayOrder = -1;
    }

    /**
     * Shows the start window and prepares the UI for empire selection or onboarding.
     */
    showStartWindow() {
        if (Workspace.GetAttribute("IsPublicServer") !== true || Workspace.GetAttribute("IsSingleServer") === true) {
            return;
        }
        const START_SCREEN_ENABLED = isStartScreenEnabled();
        if (START_SCREEN_ENABLED === undefined)
            return;

        if (RunService.IsStudio() && START_SCREEN_ENABLED === false) {
            return;
        }
        this.balanceWindowController.hideBalanceWindow();
        this.adaptiveTabController.hideSidebarButtons();
        if (Workspace.CurrentCamera !== undefined) {
            Workspace.CurrentCamera.CameraType = Enum.CameraType.Scriptable;
            Workspace.CurrentCamera.CFrame = getStartCamera().CFrame;
        }
        // 
        // START_WINDOW.Header.Position = new UDim2(0, 0, -0.4, 0);
        // START_WINDOW.Footer.Position = new UDim2(0, 0, 1.4, 0);
        // START_WINDOW.Header.Logo.Position = new UDim2(0.5, 0, -1.1, 0);
        // START_WINDOW.Header.Logo.Rotation = math.random() >= 0.5 ? 50 : -50;
        // TweenService.Create(START_WINDOW.Header, new TweenInfo(1), {Position: new UDim2(0, 0, 0, 0)}).Play();
        // TweenService.Create(START_WINDOW.Footer, new TweenInfo(1), {Position: new UDim2(0, 0, 1, 0)}).Play();
        // TweenService.Create(START_WINDOW.Header.Logo, new TweenInfo(1.4), {Position: new UDim2(0.5, 0, -0.1, 0), Rotation: 0}).Play();
        this.showTitleScreen();
        task.delay(3.5, () => {
            const newWave = () => {
                const wave = START_WINDOW.Logo.Clone();
                wave.ClearAllChildren();
                wave.Position = new UDim2(0.5, 0, 0.5, 0);
                wave.AnchorPoint = new Vector2(0.5, 0.5);
                wave.Size = new UDim2(1, 0, 1, 0);
                wave.Parent = START_WINDOW.Logo;
                TweenService.Create(wave, new TweenInfo(0.5), { Size: new UDim2(1.15, 5, 1.15, 5), ImageTransparency: 1 }).Play();
            };
            newWave();
        });
        START_WINDOW.Parent = PLAYER_GUI;
        this.soundController.refreshMusic();
    }

    /**
     * Refreshes the empires window with available empires for selection.
     * @param availableEmpires Map of available empire IDs to their info.
     */
    refreshEmpiresWindow(availableEmpires: Map<string, EmpireInfo>) {
        for (const [availableEmpire, empireInfo] of availableEmpires) {
            if (START_WINDOW.EmpiresWindow.EmpireOptions.FindFirstChild(availableEmpire) !== undefined) {
                continue;
            }
            const empireOption = ASSETS.EmpiresWindow.EmpireOption.Clone();
            empireOption.Activated.Connect(() => {
                this.uiController.playSound("MenuClick.mp3");
                const success = Packets.teleportToEmpire.invoke(availableEmpire);
                if (success) {
                    this.loadingWindowController.showLoadingWindow("Loading server");
                }
                else {
                    this.uiController.playSound("Error.mp3");
                    warn(`Failed to teleport to empire ${availableEmpire}. It may not exist or is not available.`);
                    print("Player ID: " + LOCAL_PLAYER.UserId);
                }
            });
            empireOption.Name = availableEmpire;
            empireOption.EmpireIDLabel.Text = availableEmpire;
            empireOption.EmpireInformation.Labels.TitleLabel.Text = empireInfo.name ?? "error";
            empireOption.EmpireInformation.Labels.OwnerLabel.Text = empireInfo.owner ? "Owned by " + getNameFromUserId(empireInfo.owner) : "could not load info";
            empireOption.Stats.ItemsLabel.Text = "Items: " + empireInfo.items;
            empireOption.Stats.DateCreatedLabel.Text = "Created: " + os.date("%x", empireInfo.created);
            empireOption.Stats.PlaytimeLabel.Text = "Playtime: " + convertToHHMMSS(empireInfo.playtime ?? 0);
            const color = (empireInfo.name ? ComputeNameColor(empireInfo.name) : Color3.fromRGB(0, 170, 0)) ?? Color3.fromRGB(0, 170, 0);
            empireOption.BackgroundColor3 = color;
            empireOption.UIStroke.Color = color;
            paintObjects(empireOption, color);
            empireOption.Parent = START_WINDOW.EmpiresWindow.EmpireOptions;
            task.spawn(() => {
                if (empireOption === undefined || empireOption.FindFirstChild("EmpireInformation") === undefined) {
                    return;
                }
                empireOption.EmpireInformation.OwnerAvatar.Image = empireInfo.owner ?
                    Players.GetUserThumbnailAsync(empireInfo.owner, Enum.ThumbnailType.HeadShot, Enum.ThumbnailSize.Size150x150)[0] : "";
            });
        }
    }

    /**
     * Initializes the StartWindowController, sets up UI, hotkeys, and event listeners for the start screen.
     */
    onInit() {
        const newEmpireOption = ASSETS.EmpiresWindow.NewEmpireOption.Clone();
        const ogText = newEmpireOption.MessageLabel.Text;
        newEmpireOption.Activated.Connect(() => {
            this.uiController.playSound("MenuClick.mp3");
            newEmpireOption.MessageLabel.Text = "Creating empire...";
            const success = Packets.createNewEmpire.invoke();
            if (!success) {
                newEmpireOption.MessageLabel.Text = "You have reached the empire count limit.";
                task.delay(2, () => newEmpireOption.MessageLabel.Text = ogText);
            }
            else {
                newEmpireOption.MessageLabel.Text = ogText;
            }
        });
        newEmpireOption.Parent = START_WINDOW.EmpiresWindow.EmpireOptions;

        this.hotkeysController.setHotkey(START_WINDOW.EmpiresWindow.CloseButton, Enum.KeyCode.X, () => {
            if (!START_WINDOW.EmpiresWindow.Visible) {
                return false;
            }

            this.uiController.playSound("MenuClick.mp3");
            const tween = TweenService.Create(START_WINDOW.EmpiresWindow, new TweenInfo(1), { Position: new UDim2(0.5, 0, 1.4, 0) });
            tween.Play();
            tween.Completed.Once(() => START_WINDOW.EmpiresWindow.Visible = false);
            this.showTitleScreen(true);
            return true;
        }, "Close");
        this.hotkeysController.setHotkey(START_WINDOW.AboutWindow.CloseButton, Enum.KeyCode.X, () => {
            if (!START_WINDOW.AboutWindow.Visible) {
                return false;
            }

            this.uiController.playSound("MenuClose.mp3");
            const tween = TweenService.Create(START_WINDOW.AboutWindow, new TweenInfo(0.25), { Position: new UDim2(0, 0, -0.5, 0) });
            tween.Play();
            tween.Completed.Once(() => START_WINDOW.AboutWindow.Visible = false);
            this.showTitleScreen(true);
            return true;
        }, "Close");
        const registerOption = (option: typeof START_WINDOW.MainOptions.Play, callback: () => void) => {
            option.Button.MouseEnter.Connect(() => this.uiController.playSound("EmphasisButtonHover.mp3"));
            option.Button.MouseMoved.Connect(() => option.Button.ImageColor3 = new Color3(0.75, 0.75, 0.75));
            option.Button.MouseLeave.Connect(() => option.Button.ImageColor3 = new Color3(1, 1, 1));
            option.Button.Activated.Connect(() => {
                this.uiController.playSound("EmphasisMenuSelect.mp3");
                callback();
            });
        };
        registerOption(START_WINDOW.MainOptions.Play, () => {
            START_WINDOW.EmpiresWindow.Position = new UDim2(0.5, 0, 1.4, 0);
            START_WINDOW.EmpiresWindow.Visible = true;
            TweenService.Create(START_WINDOW.EmpiresWindow, new TweenInfo(1), { Position: new UDim2(0.5, 0, 0.65, 0) }).Play();
            this.hideTitleScreen();
        });
        registerOption(START_WINDOW.MainOptions.Settings, () => {
            this.adaptiveTabController.showAdaptiveTab("Settings");
            this.hideTitleScreen();
        });
        registerOption(START_WINDOW.MainOptions.About, () => {
            START_WINDOW.AboutWindow.Position = new UDim2(0, 0, 1.5, 0);
            START_WINDOW.AboutWindow.Visible = true;
            TweenService.Create(START_WINDOW.AboutWindow, new TweenInfo(0.25), { Position: new UDim2(0, 0, 0.5, 0) }).Play();
            this.hideTitleScreen();
        });
        this.adaptiveTabController.tabHidden.connect((tab) => {
            if (tab === SETTINGS_WINDOW.Name && START_WINDOW.Parent === PLAYER_GUI)
                this.showTitleScreen(true);
        });

        START_WINDOW.EmpiresWindow.PublicEmpireWindow.JoinPublicEmpire.Activated.Connect(() => {
            this.uiController.playSound("MenuClick.mp3");
            this.hideStartWindow();
            task.delay(0.9, () => this.introController.onIntroMarkerChanged());
        });

        const contributors = new Set<string>();
        for (const [_id, item] of Items.itemsPerId) {
            if (item.creator !== undefined)
                contributors.add(item.creator);
        }
        START_WINDOW.AboutWindow.Contributors.RecipientLabel.Text = combineHumanReadable(...contributors);

        Packets.availableEmpires.observe((availableEmpires) => this.refreshEmpiresWindow(availableEmpires));
        this.showStartWindow();
    }
}