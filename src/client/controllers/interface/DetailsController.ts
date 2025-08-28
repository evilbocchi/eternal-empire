/**
 * @fileoverview Client controller for managing the details and position windows in the UI.
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
import { INTERFACE } from "client/controllers/core/UIController";
import TooltipController from "client/controllers/interface/TooltipController";

export const DETAILS_WINDOW = INTERFACE.WaitForChild("DetailsWindow") as Frame & {
    FundsBombLabel: TextLabel;
};

/**
 * Controller responsible for updating the details and position windows in the UI.
 *
 * Updates character position display, manages tooltips, and handles character events.
 */
@Controller()
export default class DetailsController implements OnInit {

    constructor(private tooltipController: TooltipController) {

    }

    /**
     * Initializes the DetailsController, sets up tooltips for the position window.
     */
    onInit() {

    }
}