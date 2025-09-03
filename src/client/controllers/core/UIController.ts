/**
 * @fileoverview Client controller for managing the main player interface.
 *
 * @since 1.0.0
 */
import { Controller, OnStart } from "@flamework/core";
import { PLAYER_GUI } from "client/constants";
import { LOCAL_PLAYER } from "shared/constants";

/**
 * The {@link ScreenGui} that contains the main interface for the {@link LOCAL_PLAYER}.
 */
export const INTERFACE = PLAYER_GUI.WaitForChild("Interface") as ScreenGui;

/**
 * Controller responsible for managing the main UI interface.
 */
@Controller()
export default class UIController implements OnStart {
    /**
     * Enables the main interface when the controller starts.
     */
    onStart() {
        INTERFACE.Enabled = true;
    }
}
