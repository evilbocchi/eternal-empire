import { loadAnimation } from "@antivivi/vrldk";
import { ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import { questState } from "client/components/quest/QuestState";
import { PLAYER_GUI } from "client/constants";
import { setVisibilityMain } from "client/hooks/useVisibility";
import MusicManager from "client/MusicManager";
import type NewBeginnings from "server/quests/NewBeginnings";
import { playSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";

let isIntroSequenceDone = false;
let isCurrentlyInIntroSequence = false;

function exit() {
    setVisibilityMain(true);
    MusicManager.refreshMusic(true);
    return false;
}

/**
 * Plays the cutscene sequence that happens in the {@link NewBeginnings} quest.
 */
export default function performNewBeginningsWakeUp() {
    Workspace.SetAttribute("Title", false);
    if (ReplicatedStorage.GetAttribute("NewBeginningsWakingUp") !== true) return exit();
    if (isIntroSequenceDone === true) return exit();

    const connection = ReplicatedStorage.GetAttributeChangedSignal("NewBeginningsWakingUp").Connect(() => {
        if (ReplicatedStorage.GetAttribute("NewBeginningsWakingUp") === false) {
            connection.Disconnect();
            exit();
        }
    });

    print("performing intro sequence");
    const screenGui = new Instance("ScreenGui");
    screenGui.IgnoreGuiInset = true;
    screenGui.ResetOnSpawn = false;
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
    screenGui.Name = "NewBeginningsWakingUp";
    screenGui.DisplayOrder = 30;
    screenGui.Parent = PLAYER_GUI;
    if (IS_EDIT) {
        eat(screenGui, "Destroy");
    }

    const blackWindow = new Instance("Frame");
    blackWindow.Size = new UDim2(1, 0, 1, 0);
    blackWindow.BackgroundColor3 = Color3.fromRGB(0, 0, 0);
    blackWindow.BackgroundTransparency = 0;
    blackWindow.Visible = true;
    blackWindow.Parent = screenGui;

    // Waking up
    let character = getPlayerCharacter();
    if (!character) {
        while (!character) {
            character = getPlayerCharacter();
            task.wait();
        }
    }
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;

    let camera = Workspace.CurrentCamera;
    if (!camera) {
        while (!camera) {
            camera = Workspace.CurrentCamera;
            task.wait();
        }
    }

    isIntroSequenceDone = true;
    isCurrentlyInIntroSequence = true;
    MusicManager.refreshMusic(true);
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

    const fabricRustle = () => playSound("FabricRustle.mp3");
    task.delay(2, () => {
        fabricRustle();
        TweenService.Create(camera, new TweenInfo(0.5), { CFrame: WAYPOINTS.NewBeginningsCamera1.CFrame }).Play();
        TweenService.Create(blackWindow, new TweenInfo(2), { BackgroundTransparency: 1 }).Play();
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
        isCurrentlyInIntroSequence = false;
    });
    return true;
}
