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
import { ContentProvider, ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import AdaptiveTabController from "client/controllers/core/AdaptiveTabController";
import { INTERFACE } from "client/controllers/core/UIController";
import BalanceWindowController from "client/controllers/interface/BalanceWindowController";
import QuestsController from "client/controllers/interface/QuestsController";
import SoundController from "client/controllers/interface/SoundController";
import { assets, getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";
import { questState } from "shared/ui/components/quest/QuestState";

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
        humanoid.RootPart!.CFrame = WAYPOINTS.NewBeginningsPlayerPos.CFrame;
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
        camera.CFrame = WAYPOINTS.NewBeginningsCamera0.CFrame;
        INTRO_WINDOW.BackgroundTransparency = 0;
        INTRO_WINDOW.Visible = true;
        this.balanceWindowController.hideBalanceWindow();
        this.adaptiveTabController.hideSidebarButtons();
        const fabricRustle = () => playSound("FabricRustle.mp3");
        task.delay(2, () => {
            fabricRustle();
            TweenService.Create(camera, new TweenInfo(0.5), { CFrame: WAYPOINTS.NewBeginningsCamera1.CFrame }).Play();
            TweenService.Create(INTRO_WINDOW, new TweenInfo(2), { BackgroundTransparency: 1 }).Play();
        });
        task.delay(2.96, () => {
            fabricRustle();
            TweenService.Create(camera, new TweenInfo(0.5), { CFrame: WAYPOINTS.NewBeginningsCamera2.CFrame }).Play();
        });
        task.delay(3.7, () => {
            fabricRustle();
            TweenService.Create(camera, new TweenInfo(0.5), { CFrame: WAYPOINTS.NewBeginningsCamera3.CFrame }).Play();
        });
        task.delay(5, () => {
            playSound("JumpSwish.mp3");
            sleepingAnimation?.Stop();
            camera.CFrame = WAYPOINTS.NewBeginningsCamera4.CFrame;
            camera.CameraType = Enum.CameraType.Custom;
            humanoid.SetStateEnabled(Enum.HumanoidStateType.Jumping, true);
            for (const transparencyPart of transparencyParts) {
                transparencyPart.LocalTransparencyModifier = 0;
            }
        });
        task.delay(7.5, () => {
            questState.setTrackedQuest("NewBeginnings");
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
            math.randomseed(42);
            this.soundController.refreshMusic(true);
            math.randomseed(tick());
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

        task.spawn(() => {
            const priority = [
                getAsset("assets/sounds/FabricRustle.mp3"),
                getAsset("assets/sounds/JumpSwish.mp3"),
                getAsset("assets/sounds/DefaultText.mp3"),
                getAsset("assets/sounds/QuestComplete.mp3"),
                getAsset("assets/sounds/QuestNextStage.mp3"),
            ];
            for (const [_, id] of pairs(assets)) {
                if (!priority.includes(id))
                    priority.push(id);
            }

            ContentProvider.PreloadAsync(priority);
        });
    }
}