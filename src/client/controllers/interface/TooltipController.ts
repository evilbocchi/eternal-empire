import { Controller, OnPhysics } from "@flamework/core";
import { TweenService, Workspace } from "@rbxts/services";
import { MOUSE, TOOLTIP_WINDOW } from "client/constants";

@Controller()
export class TooltipController implements OnPhysics {

    tooltipsPerObject = new Map<GuiObject, string>();

    hideTooltipWindow() {
        const tweenInfo = new TweenInfo(0.2);
        const tween = TweenService.Create(TOOLTIP_WINDOW, tweenInfo, { BackgroundTransparency: 1 });
        TweenService.Create(TOOLTIP_WINDOW.MessageLabel, tweenInfo, { TextTransparency: 1, TextStrokeTransparency: 1 }).Play();
        TweenService.Create(TOOLTIP_WINDOW.UIStroke, tweenInfo, { Transparency: 1 }).Play();
        tween.Play();
        tween.Completed.Connect(() => TOOLTIP_WINDOW.Visible = false);
    }

    showTooltipWindow() {
        const tweenInfo = new TweenInfo(0.2);
        TOOLTIP_WINDOW.Visible = true;
        TweenService.Create(TOOLTIP_WINDOW, tweenInfo, { BackgroundTransparency: 0.5 }).Play();
        TweenService.Create(TOOLTIP_WINDOW.UIStroke, tweenInfo, { Transparency: 0.5 }).Play();
        TweenService.Create(TOOLTIP_WINDOW.MessageLabel, tweenInfo, { TextTransparency: 0, TextStrokeTransparency: 0 }).Play();
    }

    setMessage(message: string) {
        TOOLTIP_WINDOW.MessageLabel.Text = message;
    }
    
    setTooltip(guiObject: GuiObject, message: string) {
        if (!this.tooltipsPerObject.has(guiObject)) {
            guiObject.MouseMoved.Connect(() => {
                this.showTooltipWindow();
                this.setMessage(this.tooltipsPerObject.get(guiObject) ?? "");
            });
            guiObject.MouseEnter.Connect(() => {
                this.showTooltipWindow();
            });
            guiObject.MouseLeave.Connect(() => {
                this.hideTooltipWindow();
            });
        }
        this.tooltipsPerObject.set(guiObject, message);
    }

    onPhysics() {
        const canvasSize = Workspace.CurrentCamera?.ViewportSize;
        if (canvasSize !== undefined) {
            TOOLTIP_WINDOW.AnchorPoint = new Vector2(canvasSize.X - MOUSE.X < 200 ? 1 : 0, canvasSize.Y - MOUSE.Y < 200 ? 1 : 0);
            TOOLTIP_WINDOW.Position = UDim2.fromOffset(MOUSE.X + 5, MOUSE.Y + 36);
        }
    }
}