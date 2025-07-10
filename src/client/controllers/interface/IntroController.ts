/**
 * @fileoverview Client controller for managing the intro sequence and related UI/camera effects.
 *
 * Handles:
 * - Playing the intro cutscene sequence for new players
 * - Managing camera transitions, animations, and sound effects during the intro
 * - Hiding/showing UI elements and updating quest state
 * - Integrating with UIController, AdaptiveTabController, and QuestsController
 *
 * The controller coordinates the intro experience, ensuring a smooth transition for new players and restoring UI state after the sequence.
 *
 * @since 1.0.0
 */
import { loadAnimation } from "@antivivi/vrldk";
import { Controller, OnInit } from "@flamework/core";
import { ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import UIController, { INTERFACE } from "client/controllers/core/UIController";
import AdaptiveTabController from "client/controllers/core/AdaptiveTabController";
import BalanceWindowController from "client/controllers/interface/BalanceWindowController";
import QuestsController from "client/controllers/interface/QuestsController";
import SoundController from "client/controllers/interface/SoundController";
import { getWaypoint } from "shared/constants";

export const INTRO_WINDOW = INTERFACE.WaitForChild("IntroWindow") as Frame;

/**
 * Controller responsible for managing the intro sequence, camera transitions, and UI state for new players.
 *
 * Plays the intro cutscene, manages UI visibility, and updates quest state after the sequence.
 */
@Controller()
export default class IntroController implements OnInit {

    isIntroSequenceDone = false;
    isCurrentlyInIntroSequence = false;

    constructor(
        private uiController: UIController,
        private questsController: QuestsController,
        private adaptiveTabController: AdaptiveTabController,
        private soundController: SoundController,
        private balanceWindowController: BalanceWindowController
    ) {
    }

    /**
     * Plays the intro cutscene sequence, including camera, animation, and UI transitions.
     */
    doIntroSequence() {
        print("performing intro sequence");
        const humanoid = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Humanoid");
        if (humanoid === undefined)
            return;
        const camera = Workspace.CurrentCamera;
        if (camera === undefined)
            return;
        if (this.isIntroSequenceDone === true)
            return;
        this.isIntroSequenceDone = true;
        this.isCurrentlyInIntroSequence = true;
        humanoid.RootPart!.CFrame = getWaypoint("NewBeginningsPlayerPos").CFrame;
        const head = humanoid.Parent?.WaitForChild("Head") as BasePart;
        const transparencyParts = [head];
        for (const transparencyPart of head.GetDescendants()) {
            if (transparencyPart.IsA("BasePart")) {
                transparencyPart.LocalTransparencyModifier = 1;
                transparencyParts.push(transparencyPart);
            }
        }
        head.LocalTransparencyModifier = 1;
        const sleepingAnimation = loadAnimation(humanoid, 17789845379);
        sleepingAnimation?.Play();
        camera.CameraType = Enum.CameraType.Scriptable;
        camera.CFrame = getWaypoint("NewBeginningsCamera0").CFrame;
        INTRO_WINDOW.BackgroundTransparency = 0;
        INTRO_WINDOW.Visible = true;
        this.balanceWindowController.hideBalanceWindow();
        this.adaptiveTabController.hideSidebarButtons();
        const fabricRustle = () => this.uiController.playSound("FabricRustle.mp3");
        task.delay(2, () => {
            fabricRustle();
            TweenService.Create(camera, new TweenInfo(0.5), { CFrame: getWaypoint("NewBeginningsCamera1").CFrame }).Play();
            TweenService.Create(INTRO_WINDOW, new TweenInfo(2), { BackgroundTransparency: 1 }).Play();
        });
        task.delay(2.96, () => {
            fabricRustle();
            TweenService.Create(camera, new TweenInfo(0.5), { CFrame: getWaypoint("NewBeginningsCamera2").CFrame }).Play();
        });
        task.delay(3.7, () => {
            fabricRustle();
            TweenService.Create(camera, new TweenInfo(0.5), { CFrame: getWaypoint("NewBeginningsCamera3").CFrame }).Play();
        });
        task.delay(5, () => {
            this.uiController.playSound("JumpSwish.mp3");
            sleepingAnimation?.Stop();
            camera.CFrame = getWaypoint("NewBeginningsCamera4").CFrame;
            camera.CameraType = Enum.CameraType.Custom;
            humanoid.SetStateEnabled(Enum.HumanoidStateType.Jumping, true);
            for (const transparencyPart of transparencyParts) {
                transparencyPart.LocalTransparencyModifier = 0;
            }
        });
        task.delay(7.5, () => {
            this.questsController.trackedQuest = "NewBeginnings";
            this.questsController.trackedQuestChanged.fire("NewBeginnings");
            this.isCurrentlyInIntroSequence = false;
        });
    }

    /**
     * Handles changes to the intro marker, starting or ending the intro sequence as needed.
     */
    onIntroMarkerChanged() {
        const shouldIntro = ReplicatedStorage.GetAttribute("Intro");
        if (shouldIntro === true)
            this.doIntroSequence();
        else {
            this.soundController.refreshMusic(true);
            this.adaptiveTabController.showSidebarButtons();
            this.balanceWindowController.showBalanceWindow();
        }
    }

    /**
     * Initializes the IntroController, sets up listeners for intro state changes.
     */
    onInit() {
        ReplicatedStorage.GetAttributeChangedSignal("Intro").Connect(() => this.onIntroMarkerChanged());
        if (Workspace.GetAttribute("IsPublicServer") !== true)
            this.onIntroMarkerChanged();
    }
}