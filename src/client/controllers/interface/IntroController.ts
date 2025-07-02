import { loadAnimation } from "@antivivi/vrldk";
import { Controller, OnInit } from "@flamework/core";
import { ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import UIController, { INTERFACE } from "client/controllers/UIController";
import AdaptiveTabController from "client/controllers/interface/AdaptiveTabController";
import BalanceWindowController from "client/controllers/interface/BalanceWindowController";
import QuestsController from "client/controllers/interface/QuestsController";
import SoundController from "client/controllers/interface/SoundController";
import { getWaypoint } from "shared/constants";

export const INTRO_WINDOW = INTERFACE.WaitForChild("IntroWindow") as Frame;

@Controller()
export default class IntroController implements OnInit {

    isIntroSequenceDone = false;
    isCurrentlyInIntroSequence = false;

    constructor(private uiController: UIController, private questsController: QuestsController, private adaptiveTabController: AdaptiveTabController,
        private soundController: SoundController, private balanceWindowController: BalanceWindowController) {
    }

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
        const fabricRustle = () => this.uiController.playSound("FabricRustle");
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
            this.uiController.playSound("Swish");
            sleepingAnimation?.Stop();
            camera.CFrame = getWaypoint("NewBeginningsCamera4").CFrame;
            camera.CameraType = Enum.CameraType.Custom;
            humanoid.SetStateEnabled(Enum.HumanoidStateType.Jumping, true);
            for (const transparencyPart of transparencyParts) {
                transparencyPart.LocalTransparencyModifier = 0;
            }
        });
        task.delay(7.5, () => {
            this.uiController.playSound("Ding");
            this.questsController.trackedQuest = "NewBeginnings";
            this.questsController.trackedQuestChanged.fire("NewBeginnings");
            this.isCurrentlyInIntroSequence = false;
        });
    }

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

    onInit() {
        ReplicatedStorage.GetAttributeChangedSignal("Intro").Connect(() => this.onIntroMarkerChanged());
        if (Workspace.GetAttribute("IsPublicServer") !== true)
            this.onIntroMarkerChanged();
    }
}