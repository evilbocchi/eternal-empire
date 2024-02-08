import { Controller } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { LOADING_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";

@Controller()
export class LoadingWindowController {

    constructor(private uiController: UIController) {

    }

    hideLoadingWindow() {
        TweenService.Create(LOADING_WINDOW, new TweenInfo(0.25), {Position: new UDim2(0, 0, -2, 0)}).Play();
        task.delay(0.25, () => {
            LOADING_WINDOW.Visible = false;
        });
        this.uiController.playSound("Woosh");
    }
    
    showLoadingWindow(message?: string) {
        if (message !== undefined) {
            this.refreshLoadingWindow(message);
        }
        LOADING_WINDOW.Position = new UDim2(0, 0, -2, 0)
        TweenService.Create(LOADING_WINDOW, new TweenInfo(0.25), {Position: new UDim2(0, 0, 0, 0)}).Play();
        LOADING_WINDOW.Visible = true;
        this.uiController.playSound("Woosh");
    }

    refreshLoadingWindow(message: string) {
        LOADING_WINDOW.MessageLabel.Text = message;
    }
}