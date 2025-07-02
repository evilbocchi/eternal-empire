import { Controller, OnInit } from "@flamework/core";
import { RunService } from "@rbxts/services";
import { OnCharacterAdded } from "client/controllers/ModdingController";
import { INTERFACE } from "client/controllers/UIController";
import TooltipController from "client/controllers/interface/TooltipController";

export const DETAILS_WINDOW = INTERFACE.WaitForChild("DetailsWindow") as Frame & {
    FundsBombLabel: TextLabel;
};

export const POSITION_WINDOW = INTERFACE.WaitForChild("PositionWindow") as Frame & {
    Frame: Frame & {
        PositionLabel: TextLabel;
    },
    ImageLabel: ImageLabel;
};

@Controller()
export default class DetailsController implements OnInit, OnCharacterAdded {

    constructor(private tooltipController: TooltipController) {

    }

    onCharacterAdded(character: Model) {
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        const rootPart = humanoid.RootPart;
        if (rootPart === undefined) {
            warn("What");
            return;
        }
        const connection = RunService.Heartbeat.Connect(() => {
            const pos = rootPart.Position;
            POSITION_WINDOW.Frame.PositionLabel.Text = `${math.round(pos.X)}, ${math.round(pos.Y)}, ${math.round(pos.Z)}`;
        });
        humanoid.Died.Once(() => connection.Disconnect());
    }

    onInit() {
        const msg = `Position of your character.\n<font color="rgb(200, 200, 200)" size="16">Use these coordinates to search your way through the world.</font>`;
        this.tooltipController.setMessage(POSITION_WINDOW.ImageLabel, msg);
    }
}