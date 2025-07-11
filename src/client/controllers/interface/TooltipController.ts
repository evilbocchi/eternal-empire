import { Controller, OnInit } from "@flamework/core";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import { MOUSE, TOOLTIP_WINDOW } from "client/constants";

@Controller()
export class TooltipController implements OnInit {

    tooltipsPerObject = new Map<GuiObject, string>();

    moveTooltipToMouse() {
        const canvasSize = Workspace.CurrentCamera?.ViewportSize;
        if (canvasSize) {
            TOOLTIP_WINDOW.AnchorPoint = new Vector2(canvasSize.X - MOUSE.X < 200 ? 1 : 0, canvasSize.Y - MOUSE.Y < 200 ? 1 : 0);
            TOOLTIP_WINDOW.Position = UDim2.fromOffset(MOUSE.X, MOUSE.Y + 36);
        }
    }

    hideTooltipWindow() {
        const tween = TweenService.Create(TOOLTIP_WINDOW, new TweenInfo(0.2), { GroupTransparency: 1 })
        tween.Play();
        tween.Completed.Connect(() => TOOLTIP_WINDOW.Visible = false);
    }

    showTooltipWindow() {
        TOOLTIP_WINDOW.Visible = true;
        TweenService.Create(TOOLTIP_WINDOW, new TweenInfo(0.2), { GroupTransparency: 0 }).Play();
    }

    setMessage(message: string) {
        TOOLTIP_WINDOW.Main.MessageLabel.Text = message;
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
    
    onInit() {
        RunService.Heartbeat.Connect(() => {
            this.moveTooltipToMouse();
        })
    }
}