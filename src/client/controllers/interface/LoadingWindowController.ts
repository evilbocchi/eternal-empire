import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { PLAYER_GUI } from "client/constants";
import UIController from "client/controllers/UIController";

export const LOADING_SCREEN = PLAYER_GUI.WaitForChild("LoadingScreen") as ScreenGui;
export const LOADING_WINDOW = LOADING_SCREEN.WaitForChild("LoadingWindow") as Frame & {
    Background: ImageLabel;
    Thumbnail: ImageLabel;
    MessageLabel: TextLabel;
};

@Controller()
export default class LoadingWindowController implements OnInit {

    constructor(private uiController: UIController) {

    }

    hideLoadingWindow() {
        const tween = TweenService.Create(LOADING_WINDOW, new TweenInfo(0.25), { Position: new UDim2(0, 0, -1.1, 0) });
        tween.Play();
        tween.Completed.Once(() => {
            LOADING_WINDOW.Visible = false;
        });

        if (LOADING_WINDOW.Visible === true)
            this.uiController.playSound("IntermissionEnd.mp3");
    }

    showLoadingWindow(message?: string) {
        if (message !== undefined) {
            this.refreshLoadingWindow(message);
        }
        LOADING_WINDOW.Position = new UDim2(0, 0, -1.1, 0);
        TweenService.Create(LOADING_WINDOW, new TweenInfo(0.25), { Position: new UDim2(0, 0, 0, 0) }).Play();
        LOADING_WINDOW.Visible = true;
        this.uiController.playSound("IntermissionEnter.mp3");
    }

    refreshLoadingWindow(message: string) {
        LOADING_WINDOW.MessageLabel.Text = message;
    }

    onInit() {
        task.delay(0.5, () => this.hideLoadingWindow());
    }
}