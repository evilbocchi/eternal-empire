import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit } from "@flamework/core";
import { RENAME_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import Packets from "shared/network/Packets";

@Controller()
export class RenameController implements OnInit {

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