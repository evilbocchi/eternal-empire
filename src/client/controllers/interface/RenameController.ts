/**
 * @fileoverview Client controller for managing the rename window UI and rename actions.
 *
 * Handles:
 * - Submitting rename requests using Funds or Robux
 * - Validating and sanitizing input for new names
 * - Updating UI with rename costs and current empire name
 * - Integrating with UIController for sound feedback
 *
 * The controller manages the rename window's interactions, input validation, and feedback for rename attempts.
 *
 * @since 1.0.0
 */
import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit } from "@flamework/core";
import { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/core/AdaptiveTabController";
import UIController from "client/controllers/core/UIController";
import Packets from "shared/Packets";

export const RENAME_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Rename") as Frame & {
    PurchaseOptions: Frame & {
        Funds: TextButton & {
            AmountLabel: TextLabel,
        },
        Robux: TextButton,
    },
    Input: Frame & {
        InputBox: TextBox,
        PrefixLabel: TextLabel;
    },
    FundsLabel: TextLabel;
};

/**
 * Controller responsible for managing the rename window UI and rename actions.
 *
 * Handles rename requests, input validation, and UI feedback for renaming the player's empire.
 */
@Controller()
export default class RenameController implements OnInit {

    constructor(private uiController: UIController) {

    }

    /**
     * Initializes the RenameController, sets up rename actions, input validation, and UI updates.
     */
    onInit() {
        RENAME_WINDOW.PurchaseOptions.Robux.Activated.Connect(() => Packets.promptRename.invoke(RENAME_WINDOW.Input.InputBox.Text, "robux"));
        RENAME_WINDOW.PurchaseOptions.Funds.Activated.Connect(() => {
            if (Packets.promptRename.invoke(RENAME_WINDOW.Input.InputBox.Text, "funds") === true) {
                this.uiController.playSound("ItemPurchase.mp3");
            }
            else {
                this.uiController.playSound("Error.mp3");
            }
        });
        RENAME_WINDOW.Input.InputBox.FocusLost.Connect(() => {
            [RENAME_WINDOW.Input.InputBox.Text] = RENAME_WINDOW.Input.InputBox.Text.gsub('[^%w_ ]', '');
        });
        Packets.renameCost.observe((value) => RENAME_WINDOW.PurchaseOptions.Funds.AmountLabel.Text = "$" + OnoeNum.toString(value));
        Packets.empireName.observe((value) => {
            const [prefix, suffix] = value.split("'s ");
            RENAME_WINDOW.Input.PrefixLabel.Text = prefix + "'s ";
            RENAME_WINDOW.Input.InputBox.Text = suffix;
        });
    }
}