/**
 * @fileoverview DetailsController - Client controller for managing the details and position windows in the UI.
 *
 * Handles:
 * - Displaying character position in the UI
 * - Updating Funds Bomb label and position label
 * - Integrating with TooltipController for UI hints
 * - Responding to character addition and death events
 *
 * The controller updates UI elements related to player details and coordinates, and manages tooltips for position information.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import { RunService } from "@rbxts/services";
import { OnCharacterAdded } from "client/controllers/core/ModdingController";
import { INTERFACE } from "client/controllers/core/UIController";
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

/**
 * Controller responsible for updating the details and position windows in the UI.
 *
 * Updates character position display, manages tooltips, and handles character events.
 */
@Controller()
export default class DetailsController implements OnInit, OnCharacterAdded {

    constructor(private tooltipController: TooltipController) {

    }

    /**
     * Handles character addition, sets up position updates and disconnects on death.
     * @param character The player's character model.
     */
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

    /**
     * Initializes the DetailsController, sets up tooltips for the position window.
     */
    onInit() {
        const msg = `Position of your character.\n<font color="rgb(200, 200, 200)" size="16">Use these coordinates to search your way through the world.</font>`;
        this.tooltipController.setMessage(POSITION_WINDOW.ImageLabel, msg);
    }
}