/**
 * @fileoverview Client controller for managing the loading window UI and transitions.
 *
 * Handles:
 * - Showing and hiding the loading window with animations
 * - Updating loading messages and thumbnails
 * - Integrating with UIController for sound feedback
 *
 * The controller manages the loading window's visibility, transitions, and message updates to provide feedback during loading phases.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { PLAYER_GUI } from "client/constants";
import UIController from "client/controllers/core/UIController";

export const LOADING_SCREEN = PLAYER_GUI.WaitForChild("LoadingScreen") as ScreenGui;
export const LOADING_WINDOW = LOADING_SCREEN.WaitForChild("LoadingWindow") as Frame & {
    Background: ImageLabel;
    Thumbnail: ImageLabel;
    MessageLabel: TextLabel;
};

/**
 * Controller responsible for managing the loading window UI, transitions, and messages.
 *
 * Handles showing/hiding the loading window and updating its message content.
 */
@Controller()
export default class LoadingWindowController implements OnInit {

    constructor(private uiController: UIController) {

    }

    /**
     * Hides the loading window with an animation and plays a sound.
     */
    hideLoadingWindow() {
        const tween = TweenService.Create(LOADING_WINDOW, new TweenInfo(0.25), { Position: new UDim2(0, 0, -1.1, 0) });
        tween.Play();
        tween.Completed.Once(() => {
            LOADING_WINDOW.Visible = false;
        });

        if (LOADING_WINDOW.Visible === true)
            this.uiController.playSound("IntermissionEnd.mp3");
    }

    /**
     * Shows the loading window with an animation and optional message.
     * @param message The loading message to display (optional).
     */
    showLoadingWindow(message?: string) {
        if (message !== undefined) {
            this.refreshLoadingWindow(message);
        }
        LOADING_WINDOW.Position = new UDim2(0, 0, -1.1, 0);
        TweenService.Create(LOADING_WINDOW, new TweenInfo(0.25), { Position: new UDim2(0, 0, 0, 0) }).Play();
        LOADING_WINDOW.Visible = true;
        this.uiController.playSound("IntermissionEnter.mp3");
    }

    /**
     * Updates the loading window's message label.
     * @param message The message to display.
     */
    refreshLoadingWindow(message: string) {
        LOADING_WINDOW.MessageLabel.Text = message;
    }

    /**
     * Initializes the LoadingWindowController, hides the loading window after a short delay.
     */
    onInit() {
        task.delay(0.5, () => this.hideLoadingWindow());
    }
}