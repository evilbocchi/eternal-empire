import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit } from "@flamework/core";
import { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/interface/AdaptiveTabController";
import UIController from "client/controllers/UIController";
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

@Controller()
export default class RenameController implements OnInit {

    constructor(private uiController: UIController) {

    }

    onInit() {
        RENAME_WINDOW.PurchaseOptions.Robux.Activated.Connect(() => Packets.promptRename.invoke(RENAME_WINDOW.Input.InputBox.Text, "robux"));
        RENAME_WINDOW.PurchaseOptions.Funds.Activated.Connect(() => this.uiController.playSound(Packets.promptRename.invoke(RENAME_WINDOW.Input.InputBox.Text, "funds") === true ? "Coins" : "Error"));
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