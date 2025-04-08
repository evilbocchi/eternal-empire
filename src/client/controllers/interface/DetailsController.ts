import { Controller, OnInit } from "@flamework/core";
import { RunService } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { INTERFACE } from "client/controllers/UIController";
import { TooltipController } from "client/controllers/interface/TooltipController";

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
export class DetailsController implements OnInit {

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
        if (LOCAL_PLAYER.Character !== undefined) {
            this.onCharacterAdded(LOCAL_PLAYER.Character);
        }
        LOCAL_PLAYER.CharacterAdded.Connect((model) => this.onCharacterAdded(model));
        const msg = `Position of your character.\n<font color="rgb(200, 200, 200)" size="16">Use these coordinates to search your way through the world.</font>`;
        this.tooltipController.setMessage(POSITION_WINDOW.ImageLabel, msg);
    }
}